import Link from 'next/link'

export default function lessonexplorerPage() {
    return (
      <div>
        <h1>Welcome to the Lesson Explorer</h1>
        <Link href= "/">
        <button className="mt-6 px-6 py-3 bg-[#66ff00] text-black rounded-lg text-lg font-semibold hover:bg-[#4ccd00] transition duration-300">
        Back to Home
        </button>
        </Link>

      </div>
    );
  }
  