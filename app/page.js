//import Image from "next/image";
import Asteroids from '../components/Asteroids';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        
        <Asteroids />
        
    </div>
  );
}
