'use client'

import Button from '@/app/util/Button'

/**
 * @returns Page for testing front and back-end communication
 */
export default function testing() {
  return (
    <>
      <Button text={'FETCH DATA'} onClick={() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LWFkbWluLTEyMDM4MTIwMyIsImVtYWlsIjoiZ29vZ2xlLmNvbSIsInRlc3RfdG9rZW4iOnRydWUsImV4cCI6MTc0MzM2Mjg2NX0.vQUlcvoTICsquY9ljMvF1bWOz5qJNtVUpuz4BfLAOnU'
          }
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error(err))
      }}/>

      <Button text={'LOGIN'} onClick={() => {
        fetch('${process.env.NEXT_PUBLIC_API_URL}/login?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzIiwiZW1haWwiOiJ0ZXNAZXhhbXBsZS5jb20iLCJ0ZXN0X3Rva2VuIjp0cnVlLCJleHAiOjE3NDMzNjM0NTd9.PaqyKqEvgrccX6M--x2NYKGuoNqJZXUXkMuxMs-FcqA', {
          method: 'POST'
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error(err))
      }} />
    </>
  )
}