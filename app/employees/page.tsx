'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('name')
      setEmployees(data || [])
    }
    
    fetchEmployees()
  }, [])

  return (
    <div className="p-4 pb-24">
      <header className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()}
          className="icon-btn bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">员工列表</h1>
        <div className="w-10" />
      </header>
      
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <input
            type="text"
            placeholder="搜索员工..."
            className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {employees && employees.length > 0 ? (
          employees.map((employee) => (
            <div key={employee.id} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">{employee.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-gray-500">{employee.position || '员工'} · {employee.email}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-400">暂无员工信息</p>
          </div>
        )}
      </div>
    </div>
  )
}
