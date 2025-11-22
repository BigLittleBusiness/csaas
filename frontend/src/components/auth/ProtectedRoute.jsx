import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  
  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check admin requirement
  if (requireAdmin && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Access Denied</h2>
              <p className="text-[#64748B] mb-6">
                You don't have permission to access this page. Admin access is required.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0891B2] transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        );
      }
    } catch (err) {
      console.error('Failed to parse user data:', err);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
