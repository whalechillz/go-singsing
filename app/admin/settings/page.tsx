'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Plus, Trash2, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Setting {
  id: string
  key: string
  value: string
  description: string
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: ''
  })
  


  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('singsing_settings')
        .select('*')
        .order('key')

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error('Error fetching settings:', error)
      alert("설정을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (setting: Setting) => {
    try {
      const { error } = await supabase
        .from('singsing_settings')
        .update({ 
          value: setting.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', setting.id)

      if (error) throw error

      alert("설정이 저장되었습니다.")
      
      setEditingId(null)
      fetchSettings()
    } catch (error) {
      console.error('Error saving setting:', error)
      alert("저장 중 오류가 발생했습니다.")
    }
  }

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('singsing_settings')
        .insert([formData])

      if (error) throw error

      alert("새 설정이 추가되었습니다.")
      
      setIsAddModalOpen(false)
      setFormData({ key: '', value: '', description: '' })
      fetchSettings()
    } catch (error) {
      console.error('Error adding setting:', error)
      alert("추가 중 오류가 발생했습니다.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('singsing_settings')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert("설정이 삭제되었습니다.")
      
      fetchSettings()
    } catch (error) {
      console.error('Error deleting setting:', error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const getInputType = (key: string) => {
    if (key.includes('phone') || key.includes('mobile')) return 'tel'
    if (key.includes('email')) return 'email'
    if (key.includes('url')) return 'url'
    return 'text'
  }

  const isTextarea = (key: string) => {
    return key.includes('message') || key.includes('text') || key.includes('description')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96">로딩 중...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">설정 관리</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 설정 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 설정 추가</DialogTitle>
              <DialogDescription>
                새로운 설정 항목을 추가합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="key" className="text-sm font-medium">키 (영문)</label>
                <input
                  id="key"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="예: company_address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="value" className="text-sm font-medium">값</label>
                <input
                  id="value"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">설명</label>
                <input
                  id="description"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAdd}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{setting.key}</CardTitle>
                  <CardDescription>{setting.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {editingId === setting.id ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleSave(setting)}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        저장
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingId(setting.id)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        수정
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(setting.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === setting.id ? (
                isTextarea(setting.key) ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={setting.value}
                    onChange={(e) => {
                      const updated = settings.map(s => 
                        s.id === setting.id ? { ...s, value: e.target.value } : s
                      )
                      setSettings(updated)
                    }}
                    rows={3}
                  />
                ) : (
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type={getInputType(setting.key)}
                    value={setting.value}
                    onChange={(e) => {
                      const updated = settings.map(s => 
                        s.id === setting.id ? { ...s, value: e.target.value } : s
                      )
                      setSettings(updated)
                    }}
                  />
                )
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  {setting.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
