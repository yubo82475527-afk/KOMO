'use client'

import { useState } from 'react'

export default function AdminScheduleImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; imported: number; errors: any[] } | null>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    
    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/import-schedule', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    setResult(data)
    setUploading(false)
  }

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
        <h1 className="text-xl font-bold">导入排班</h1>
        <div className="w-10" />
      </header>
      
      <div className="card">
        <h3 className="font-semibold mb-3">上传 Excel 文件</h3>
        <form onSubmit={handleSubmit}>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-600">{file.name}</p>
              </div>
            ) : (
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500">点击或拖拽上传文件</p>
                <p className="text-xs text-gray-400 mt-1">支持 .xlsx, .xls 格式</p>
              </div>
            )}
          </label>
          
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full btn btn-primary mt-4 py-3"
          >
            {uploading ? '上传中...' : '开始导入'}
          </button>
        </form>
      </div>
      
      {result && (
        <div className={`card mt-4 ${result.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <h3 className="font-semibold mb-3">导入结果</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">导入成功</span>
              <span className="font-bold text-green-600">{result.imported} 条</span>
            </div>
            {result.errors && result.errors.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">错误数量</span>
                  <span className="font-bold text-red-600">{result.errors.length} 条</span>
                </div>
                <div className="max-h-40 overflow-y-auto mt-2">
                  {result.errors.map((error: any, index: number) => (
                    <p key={index} className="text-sm text-red-500">
                      行{error.row}: {error.error}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="card mt-4">
        <h3 className="font-semibold mb-3">Excel 模板说明</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• 文件格式: Excel (.xlsx 或 .xls)</p>
          <p>• 列格式: email, shift, date</p>
          <p>• email: 员工邮箱</p>
          <p>• shift: 班次名称（早班/中班/晚班/休息）</p>
          <p>• date: 日期（格式: YYYY-MM-DD）</p>
        </div>
      </div>
    </div>
  )
}
