import Image from "next/image";
import Link from 'next/link'

export default function Home() {
  return (
    <div className="center-container">
      <h1>Bienvenido al MindMap</h1>
      <Link href= "/lessonexplorer">
      <button className="mt-6 px-6 py-3 bg-[#66ff00] text-black rounded-lg text-lg font-semibold hover:bg-[#4ccd00] transition duration-300">
        See Lessons
      </button>
      </Link>
    </div>
  );
}
