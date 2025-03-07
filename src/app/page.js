import Link from 'next/link';
import Button from '@/app/util/Button';

export default function Home() {
  return (
    <div className="center-container">
      <h1>Bienvenido al MindMap</h1>
      <Link href= "/lessonexplorer">
      	<Button text="See Lessons" />
      </Link>
    </div>
  );
}
