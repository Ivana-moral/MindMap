'use client'; //Required for Next.js App Router to use React hooks like useState/useEffect
import { useEffect, useState, useRef } from 'react';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/util/auth/AuthContext';

import styles from './page.module.css';
// PrimeReact DataTable core and theme import 
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import "primereact/resources/themes/lara-light-cyan/theme.css";
//PrimeReact utility and UI component for filtering
import {FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
//Expanded Rows
import { Toast } from 'primereact/toast';

export default function ReportExplorer() {
	// Get URL params and check user session status
	const router = useRouter();
    const { id } = useParams();
	const { user, loading } = useAuth();
	// Track fetching status and table data
	const [ fetching, setFetching ] = useState(true);
	const [ students, setStudents] = useState([]);
	// Defines search rules for global search and specific columns
	const [filters, setFilters] = useState({ 
		global: { value: null, matchMode: FilterMatchMode.CONTAINS },
		user_email: { value: null, matchMode: FilterMatchMode.CONTAINS  },
		user_role: {value: null, matchMode: FilterMatchMode.CONTAINS },
		username: {value: null, matchMode: FilterMatchMode.CONTAINS },
		user_id: {value: null, matchMode: FilterMatchMode.CONTAINS }
	});
	const [globalFilterValue, setGlobalFilterValue] = useState(''); //Filters 
	const [expandedRows, setExpandedRows] = useState(null); //Expanded Rows for Lessons
	const toast = useRef(null);
	// An array that controls which columns appear
	// Runs on mount. Authenticates, fetches report, and formats data.
	useEffect(() => {		
		if(loading) {
			return;
		}

		if(!user) {
			router.replace('/login');
			return;
		}

		async function fetchData() {
			try {
				const jwt = await user.getIdToken();
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/report/${id}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${jwt}`
					}
				});

				if(!res.ok) {
					throw new Error(`HTTP Error! Status Code ${res.status}`);
				}

				const data = await res.json();

				//Formatting API response to match our dynamic column 'field' keys
				//const formattedStudents = data.map(item => ({
				//	studentId: item.studentEmail,
				//	studentRole: item.role,
				//	studentUserName: item.username
					//studentName: item.name // Ensure this is uncommented to show in the table
				//})).filter(student => student.studentRole === "student"); 

				setStudents(data);

			} catch(err) {
				console.error('Failed to fetch students:', err);
			} finally {
				setFetching(false);
			}
		}

		fetchData();

	}, [user, loading, router]);

	// Updates the filter state when the user types in the search bar
    const onGlobalFilterChange = (e) => {
		console.log (e);
		const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
	

	const onRowExpand = (event) => {
        toast.current.show({ severity: 'info', summary: 'Lessons Expanded', detail: event.data.user, life: 3000 });
    };

	const onRowCollapse = (event) => {
        toast.current.show({ severity: 'success', summary: 'Lessons Collapsed', detail: event.data.user, life: 3000 });
    };

	const expandAll = () => {
        let _expandedRows = {};

        students.forEach((s) => (_expandedRows[`${s.user_id}`] = true));

        setExpandedRows(_expandedRows);
    };

	const collapseAll = () => {
        setExpandedRows(null);
    };

	const allowExpansion = (rowData) => {
		return rowData.lessons.length > 0;
    };

	const rowExpansionTemplate = (data) => {
        return (
            <div className="p-3">
                <h5>Student Progress {students.username}</h5>
                <DataTable value={data.lessons}>
                    <Column field="lesson_number" header="Lesson number" sortable ></Column>
                    <Column field="lesson_name" header="Lesson" sortable></Column>
                    <Column field="mastered" header="Mastered"  ></Column>
                    <Column field="completed" header="Completed" sortable ></Column>
                    <Column headerStyle={{width:'4rem'}}></Column>

                </DataTable>
            </div>
        );
    };
	// Renders the search input inside the table header
	const renderHeader = () => {
        return (
			<div>
				<div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '.5rem'}}>
					<Button icon="pi pi-check" label="Expand All" onClick={expandAll} size="Large" text style={{border:'3px solid lightgray', alignItems: 'center', display: 'flex', justifyContent: 'center'}} />
            		<Button icon="pi pi-minus" label="Collapse All" onClick={collapseAll} text style={{border:'3px solid lightgray', alignItems: 'center', display: 'flex', justifyContent: 'center'}} />
				</div>
            	<div>
					<IconField iconPosition="left">
                    	<InputIcon className="pi pi-search" />
                    	<InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
					
                	</IconField>
            	</div>
			</div>
        );
    };

	

	const header = renderHeader();
	if(loading || fetching) {
		return <div>Loading...</div>
	}

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Students List</h2>
            <hr className={styles.divider}/>
			<Toast ref={toast} />
			<DataTable value={students} stripedRows filters={filters} filterDisplay="row" expandedRows={expandedRows} 
				onRowToggle={(e)=> setExpandedRows(e.data)} onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} 
				rowExpansionTemplate={rowExpansionTemplate}	dataKey="user_id" header={header} 
				globalFilterFields={['user_id', 'username', 'user_role']} loading={loading} tableStyle={{minWidth:'70rem'}} 
				emptyMessage="No Students found">
				<Column expander={allowExpansion} style={{width: 'rem'}}/>
				<Column field="user_id" header="UserID" filter sortable></Column>
				<Column field="username" header="Name" filter sortable></Column>
				<Column field="user_role" header="Role" filter sortable></Column>	
			</DataTable>
            
        </div>
    );
}
