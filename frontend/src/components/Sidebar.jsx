import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  PlayCircle, 
  Settings, 
  Menu,
  X,
  Brain,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Playbooks', href: '/playbooks', icon: PlayCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={cn(
            "flex items-center space-x-3 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Virtual CSM</h1>
              <p className="text-xs text-gray-500">AI-Powered Success</p>
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

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "flex-shrink-0 w-5 h-5",
                  isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
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
        </nav>

        {/* Status indicators */}
        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            "space-y-2 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">System Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">AI Engine</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
          
          {!isOpen && (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

