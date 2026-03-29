//import Image from "next/image";
import MatterGame from '../../components/Matter'; // <-- Import Solitaire component

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
 
        
        <MatterGame /> {/* <-- Add Solitaire component here */}
        
        
    </div>
  );
}
