// components/Navigation.js

export default function Navigation() {
    return (
        <nav className="w-full bg-gray-900 text-gray-300 py-4">
            <div className="container mx-auto flex justify-center gap-8">
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#" className="hover:text-white transition-colors">Game</a>
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
        </nav>
    );
}