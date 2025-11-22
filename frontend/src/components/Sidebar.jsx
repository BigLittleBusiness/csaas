import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  PlayCircle, 
  Settings, 
  Menu,
  X,
  Shield,
  Building2,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showAdminMenu, setShowAdminMenu] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (err) {
        console.error('Failed to parse user data:', err)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Playbooks', href: '/playbooks', icon: PlayCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Shield },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Organization', href: '/admin/organization', icon: Building2 },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0F172A] bg-opacity-75 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-[#E2E8F0] transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
          <div className={cn(
            "flex items-center space-x-3 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#0F172A] to-[#14B8A6] rounded-lg">
              <span className="text-sm font-bold text-white">U</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0F172A] font-['Poppins']">UpliftCS</h1>
              <p className="text-xs text-[#64748B]">Customer Success</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1.5"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {mainNavigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-[#14B8A6]/10 text-[#14B8A6]"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                )}
              >
                <Icon className={cn(
                  "flex-shrink-0 w-5 h-5",
                  isActive ? "text-[#14B8A6]" : "text-[#64748B] group-hover:text-[#0F172A]",
                  isOpen ? "mr-3" : "mx-auto"
                )} />
                <span className={cn(
                  "transition-opacity duration-300",
                  isOpen ? "opacity-100" : "opacity-0 w-0"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className={cn(
                "pt-4 pb-2 transition-opacity duration-300",
                isOpen ? "opacity-100" : "opacity-0"
              )}>
                <div className="px-2">
                  <div className="h-px bg-[#E2E8F0] mb-2"></div>
                  <button
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                    className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider hover:text-[#0F172A]"
                  >
                    <span>Admin</span>
                    <ChevronDown className={cn(
                      "w-3 h-3 transition-transform",
                      showAdminMenu && "transform rotate-180"
                    )} />
                  </button>
                </div>
              </div>

              {showAdminMenu && adminNavigation.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-[#14B8A6]/10 text-[#14B8A6]"
                        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                    )}
                  >
                    <Icon className={cn(
                      "flex-shrink-0 w-5 h-5",
                      isActive ? "text-[#14B8A6]" : "text-[#64748B] group-hover:text-[#0F172A]",
                      isOpen ? "mr-3" : "mx-auto"
                    )} />
                    <span className={cn(
                      "transition-opacity duration-300",
                      isOpen ? "opacity-100" : "opacity-0 w-0"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-[#E2E8F0]">
          {isOpen && user ? (
            <div className="space-y-3">
              <div className="px-2">
                <p className="text-sm font-medium text-[#0F172A] truncate">{user.name}</p>
                <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                {user.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-[#14B8A6] bg-[#14B8A6]/10 rounded">
                    {user.role}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
