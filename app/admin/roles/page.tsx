"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Shield, Plus, Edit2, Trash2, Check, X, Users } from "lucide-react";

type Role = {
  id: string;
  name: string;
  description?: string;
  permissions?: any;
  created_at: string;
  updated_at?: string;
  user_count?: number;
};

const PERMISSIONS = {
  tours: {
    label: "투어 관리",
    actions: ["read", "create", "update", "delete"]
  },
  participants: {
    label: "참가자 관리",
    actions: ["read", "create", "update", "delete"]
  },
  documents: {
    label: "문서 관리",
    actions: ["read", "create", "update", "delete"]
  },
  staff: {
    label: "스태프 관리",
    actions: ["read", "create", "update", "delete"]
  },
  users: {
    label: "사용자 관리",
    actions: ["read", "create", "update", "delete"]
  },
  payments: {
    label: "결제 관리",
    actions: ["read", "create", "update", "delete"]
  },
  reports: {
    label: "보고서",
    actions: ["read", "export"]
  }
};

const ACTION_LABELS: Record<string, string> = {
  read: "조회",
  create: "생성",
  update: "수정",
  delete: "삭제",
  export: "내보내기"
};

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: {} as any
  });

  // 역할 목록 불러오기
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("*")
        .order("created_at", { ascending: true });

      if (roleError) {
        // roles 테이블이 없는 경우 기본 역할 표시
        console.log("Using default roles");
        setRoles([
          {
            id: "1",
            name: "admin",
            description: "관리자",
            permissions: { all: true },
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "manager",
            description: "매니저",
            permissions: {
              tours: true,
              participants: true,
              documents: true,
              staff: ["read"],
              payments: ["read"]
            },
            created_at: new Date().toISOString()
          },
          {
            id: "3",
            name: "operator",
            description: "운영직원",
            permissions: {
              tours: ["read", "update"],
              participants: ["read", "update"],
              documents: ["read"]
            },
            created_at: new Date().toISOString()
          },
          {
            id: "4",
            name: "employee",
            description: "일반직원",
            permissions: {
              tours: ["read"],
              participants: ["read"],
              documents: ["read"]
            },
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        // 각 역할별 사용자 수 계산
        const { data: userCounts } = await supabase
          .from("users")
          .select("role_id")
          .not("role_id", "is", null);

        const countMap = userCounts?.reduce((acc, user) => {
          acc[user.role_id] = (acc[user.role_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const rolesWithCount = (roleData || []).map(role => ({
          ...role,
          user_count: countMap[role.id] || 0
        }));

        setRoles(rolesWithCount);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 권한 저장
  const handleSave = async () => {
    try {
      if (!formData.name) {
        alert("역할 이름을 입력하세요.");
        return;
      }

      if (editingRole) {
        // 수정
        const { error } = await supabase
          .from("roles")
          .update({
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingRole.id);

        if (error) throw error;
      } else {
        // 추가
        const { error } = await supabase
          .from("roles")
          .insert({
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
          });

        if (error) throw error;
      }

      alert("저장되었습니다.");
      setShowModal(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      console.error("Error saving role:", error);
      if (error.code === '23505') {
        alert("이미 존재하는 역할 이름입니다.");
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    }
  };

  // 역할 삭제
  const handleDelete = async (role: Role) => {
    if (role.user_count && role.user_count > 0) {
      alert(`이 역할을 사용 중인 사용자가 ${role.user_count}명 있습니다.\n먼저 사용자의 역할을 변경해주세요.`);
      return;
    }

    if (!confirm(`'${role.description || role.name}' 역할을 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", role.id);

      if (error) throw error;

      alert("삭제되었습니다.");
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: {}
    });
    setEditingRole(null);
  };

  // 수정 모드
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || {}
    });
    setShowModal(true);
  };

  // 권한 토글
  const togglePermission = (resource: string, action?: string) => {
    const newPermissions = { ...formData.permissions };

    if (!action) {
      // 전체 권한 토글
      if (newPermissions[resource] === true) {
        delete newPermissions[resource];
      } else {
        newPermissions[resource] = true;
      }
    } else {
      // 특정 액션 토글
      if (!newPermissions[resource] || newPermissions[resource] === true) {
        newPermissions[resource] = [action];
      } else if (Array.isArray(newPermissions[resource])) {
        const actions = newPermissions[resource] as string[];
        const index = actions.indexOf(action);
        if (index > -1) {
          actions.splice(index, 1);
          if (actions.length === 0) {
            delete newPermissions[resource];
          }
        } else {
          actions.push(action);
        }
      }
    }

    setFormData({ ...formData, permissions: newPermissions });
  };

  // 권한 확인
  const hasPermission = (resource: string, action?: string): boolean => {
    const perms = formData.permissions;
    if (perms.all === true) return true;
    if (!perms[resource]) return false;
    if (perms[resource] === true) return true;
    if (action && Array.isArray(perms[resource])) {
      return perms[resource].includes(action);
    }
    return false;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">권한 관리</h1>
        <p className="text-gray-600 mt-1">시스템 역할과 권한을 설정합니다.</p>
      </div>

      {/* 역할 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">역할 목록</h2>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            역할 추가
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y">
            {roles.map(role => (
              <div key={role.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {role.description || role.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        시스템 이름: {role.name}
                      </p>
                      {role.user_count !== undefined && (
                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {role.user_count}명의 사용자
                        </p>
                      )}
                      
                      {/* 권한 요약 */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.permissions?.all === true ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            전체 권한
                          </span>
                        ) : (
                          Object.entries(role.permissions || {}).map(([key, value]) => {
                            const label = PERMISSIONS[key as keyof typeof PERMISSIONS]?.label || key;
                            return (
                              <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {label}
                                {Array.isArray(value) && ` (${value.length})`}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {role.name !== 'admin' && (
                      <button
                        onClick={() => handleDelete(role)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? "역할 수정" : "역할 추가"}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    역할 이름 (영문) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    표시 이름
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 매니저"
                  />
                </div>
              </div>

              {/* 전체 권한 */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.all === true}
                    onChange={() => {
                      if (formData.permissions.all === true) {
                        setFormData({ ...formData, permissions: {} });
                      } else {
                        setFormData({ ...formData, permissions: { all: true } });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="font-medium">전체 권한</span>
                </label>
                <p className="text-xs text-gray-500 ml-6">모든 기능에 대한 전체 권한을 부여합니다.</p>
              </div>

              {/* 개별 권한 */}
              {formData.permissions.all !== true && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-medium text-gray-900">개별 권한 설정</h3>
                  
                  {Object.entries(PERMISSIONS).map(([resource, config]) => (
                    <div key={resource} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasPermission(resource)}
                            onChange={() => togglePermission(resource)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="font-medium">{config.label}</span>
                        </label>
                      </div>
                      
                      {hasPermission(resource) && formData.permissions[resource] !== true && (
                        <div className="ml-6 mt-2 flex flex-wrap gap-3">
                          {config.actions.map(action => (
                            <label key={action} className="flex items-center gap-1 text-sm">
                              <input
                                type="checkbox"
                                checked={hasPermission(resource, action)}
                                onChange={() => togglePermission(resource, action)}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span>{ACTION_LABELS[action] || action}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingRole ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}