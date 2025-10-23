export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">Selamat Datang di Natea Coffee</h1>
      <p className="mb-6 text-gray-600">Aplikasi pesan makanan online natea coffee</p>
      <a href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Login</a>
    </div>
  );
}
