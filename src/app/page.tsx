import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">HiFive</h1>
            <div className="space-x-4">
              <Link href="/auth/sign-in" className="text-gray-700 hover:text-blue-600 font-medium">
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to HiFive</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your all-in-one co-working business management platform
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Management</h3>
              <p className="text-gray-600">Track memberships, passes, and exclusive promos for your members</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">View customer logs, sales, and expenses with real-time insights</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-gray-600">Admin, Staff, and Member roles with customized permissions</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/sign-in"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-8 rounded-md transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
