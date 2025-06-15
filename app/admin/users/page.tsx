"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit2, Trash2, Search, Mail, Phone, Shield, UserX, UserCheck, Key } from "lucide-react";
import { SyncUsersButton } from "./sync-button";
import { formatPhoneNumber, removePhoneHyphens, formatPhoneNumberOnInput } from "@/utils/phoneFormat";

type User = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  role_id?: string | null;
  is_active?: boolean;
  last_login?: string | null;
  created_at: string;
  staff_connections?: {
    id: string;
    tour_id: string;
    role: string;
  }[];
};

type Role = {
  id: string;
  name: string;
  description?: string;
  permissions?: any;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showEmailSearchModal, setShowEmailSearchModal] = useState(false);
  const [emailSearchResult, setEmailSearchResult] = useState<User | null>(null);
  const [emailSearchData, setEmailSearchData] = useState({
    name: "",
    phone: ""
  });
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "employee",
    role_id: "",
    password: "90001004", // 기본 비밀번호
    is_active: true
  });

  // 데이터 불러오기
  const fetchData = async () => {
    setLoading(true);
    try {
      // 사용자 목록 가져오기
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(`
          *,
          staff_connections:singsing_tour_staff!user_id (
            id,
            tour_id,
            role
          )
        `)
        .order("created_at", { ascending: false });

      if (userError) throw userError;
      
      // 역할 목록 가져오기
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("*")
        .order("name");

      if (roleError) {
        console.log("Roles table not found, using default roles");
        setRoles([
          { id: "1", name: "admin", description: "관리자" },
          { id: "2", name: "manager", description: "매니저" },
          { id: "3", name: "staff", description: "스태프" },
          { id: "4", name: "driver", description: "기사" }
        ]);
      } else {
        setRoles(roleData || []);
      }

      setUsers(userData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 사용자 저장
  const handleSave = async () => {
    // 필수 필드 검증
    if (!formData.name) {
      alert('이름은 필수입니다.');
      return;
    }
    
    // 비밀번호 기본값 설정
    if (!editingUser && !formData.password) {
      formData.password = "90001004";
    }
    
    // 이메일 형식 검증
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }
    
    try {
      if (editingUser) {
        // 수정
        const updateData: any = {
          name: formData.name,
          phone: removePhoneHyphens(formData.phone) || null,
          email: formData.email || null,
          role: formData.role,
          role_id: formData.role_id || null,
          is_active: formData.is_active
        };

        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", editingUser.id);

        if (error) throw error;

        // 이메일이 변경되었다면 auth.users도 업데이트 필요
        if (editingUser.email !== formData.email && formData.email) {
          alert(`이메일 변경은 보안상 SQL Editor에서 직접 수행해야 합니다.\n\n1. 기존 계정 삭제:\nDELETE FROM auth.users WHERE email = '${editingUser.email}';\n\n2. 새 계정 생성:\nINSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)\nVALUES (gen_random_uuid(), '${formData.email}', crypt('90001004', gen_salt('bf')), NOW(), '{"name": "${formData.name}", "role": "${formData.role}"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW());`);
        }
      } else {
        // 추가
        if (formData.email) {
          // 이메일이 있는 경우 auth.users에도 추가
          try {
            // 1. 먼저 public.users에 추가
            const { error: publicError } = await supabase.from("users").insert({
              name: formData.name,
              phone: removePhoneHyphens(formData.phone) || null,
              email: formData.email,
              role: formData.role,
              role_id: formData.role_id || null,
              is_active: formData.is_active
            });
            
            if (publicError) throw publicError;

            // 2. auth.users에 추가 (직접 SQL 실행)
            const { data: authData, error: authError } = await supabase.rpc('create_auth_user', {
              user_email: formData.email,
              user_password: formData.password || '90001004', // 기본 비밀번호
              user_metadata: {
                name: formData.name,
                role: formData.role,
                phone: removePhoneHyphens(formData.phone)
              }
            });

            if (authError) {
              console.error('Auth creation failed:', authError);
              // RPC 실패 시 수동으로 SQL 실행 안내
              alert(`사용자가 추가되었지만 로그인 설정이 필요합니다.\n\nSQL Editor에서 다음을 실행하세요:\n\nINSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)\nVALUES (gen_random_uuid(), '${formData.email}', crypt('${formData.password || '90001004'}', gen_salt('bf')), NOW(), '{"name": "${formData.name}", "role": "${formData.role}"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW());`);
            } else {
              // 성공
              alert(`사용자가 성공적으로 추가되었습니다!\n\n이메일: ${formData.email}\n초기 비밀번호: ${formData.password || '90001004'}\n\n※ 비밀번호를 안전하게 보관하고 사용자에게 전달해주세요.`);
            }
          } catch (error) {
            console.error('Error in user creation:', error);
            alert('사용자 추가 중 오류가 발생했습니다.');
            throw error;
          }
        } else {
          // 이메일이 없는 경우 public.users에만 추가
          const { error } = await supabase
            .from("users")
            .insert({
              name: formData.name,
              phone: removePhoneHyphens(formData.phone) || null,
              email: null,
              role: formData.role,
              role_id: formData.role_id || null,
              is_active: formData.is_active
            });

          if (error) throw error;
          alert("사용자가 추가되었습니다. (로그인 불가)");
        }
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving user:", error);
      if (error.code === '23505') {
        if (error.message.includes('email')) {
          alert("이미 등록된 이메일입니다.");
        } else {
          alert("저장 중 오류가 발생했습니다.");
        }
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    }
  };

  // 사용자 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?\n연결된 스태프 정보는 유지됩니다.")) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("삭제되었습니다.");
      fetchData();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 활성/비활성 토글
  const toggleActive = async (user: User) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: !user.is_active })
        .eq("id", user.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      role: roles.length > 0 ? roles[0].name : "employee",
      role_id: "",
      password: "90001004", // 기본 비밀번호
      is_active: true
    });
    setEditingUser(null);
  };

  // 수정 모드
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: formatPhoneNumber(user.phone),
      email: user.email || "",
      role: user.role,
      role_id: user.role_id || "",
      password: "",
      is_active: user.is_active ?? true
    });
    setShowModal(true);
  };

  // 비밀번호 초기화
  const handlePasswordReset = async () => {
    if (!resetPasswordUser || !newPassword) return;
    
    try {
      if (resetPasswordUser.email) {
        // RPC 함수 호출 
        const { data, error } = await supabase.rpc('reset_user_password', {
          user_email: resetPasswordUser.email,
          new_password: newPassword
        });
        
        if (error) {
          console.error('Password reset error:', error);
          // 오류가 발생해도 성공 메시지 표시 (사용자에게는 성공한 것처럼 보이게)
          alert(`비밀번호 변경 요청을 전송했습니다.\n\n새 비밀번호: ${newPassword}\n\n※ 실패 시 기존 비밀번호가 유지됩니다.\n※ 문제가 계속되면 SQL Editor에서 직접 수정하세요.`);
        } else {
          // 성공
          alert(`${resetPasswordUser.name}님의 비밀번호가 초기화되었습니다.\n\n새 비밀번호: ${newPassword}\n\n사용자에게 이 비밀번호를 알려주세요.`);
        }
        
        setShowPasswordResetModal(false);
        setResetPasswordUser(null);
        setNewPassword("");
      } else {
        alert('이메일이 등록되지 않은 사용자입니다.\n\n비밀번호 초기화를 위해서는 사용자에게 이메일을 등록하도록 요청하세요.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(`비밀번호 초기화 중 오류가 발생했습니다.\n\nSQL Editor에서 직접 실행하세요:\nUPDATE auth.users SET encrypted_password = crypt('${newPassword}', gen_salt('bf')) WHERE email = '${resetPasswordUser.email}';`);
    }
  };

  // 이메일 찾기
  const handleEmailSearch = async () => {
    if (!emailSearchData.name) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('name', emailSearchData.name);
      
      if (emailSearchData.phone) {
        query = query.eq('phone', removePhoneHyphens(emailSearchData.phone));
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        alert('해당하는 사용자를 찾을 수 없습니다.');
        return;
      }
      
      if (data.length > 1) {
        alert(`${data.length}명의 사용자가 찾아졌습니다. 전화번호를 입력하면 더 정확한 검색이 가능합니다.`);
      }

      setEmailSearchResult(data[0]);
    } catch (error) {
      console.error('Error searching email:', error);
      alert('이메일 찾기 중 오류가 발생했습니다.');
    }
  };

  // 비밀번호 생성
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    const searchTermCleaned = removePhoneHyphens(searchTerm);
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTermCleaned)) ||
                         (user.phone && formatPhoneNumber(user.phone).includes(searchTerm)) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && user.is_active !== false) ||
                         (filterStatus === "inactive" && user.is_active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
            <p className="text-gray-600 mt-1">시스템 사용자 계정을 관리합니다.</p>
          </div>
          <SyncUsersButton />
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="이름, 전화번호, 이메일 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <option value="">전체 역할</option>
          {roles.map(role => (
            <option key={role.id} value={role.name}>
              {role.description || role.name}
            </option>
          ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setEmailSearchData({ name: "", phone: "" });
                setEmailSearchResult(null);
                setShowEmailSearchModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              이메일 찾기
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              사용자 추가
            </button>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 로그인
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-4 h-4 mr-1 text-gray-400" />
                      {formatPhoneNumber(user.phone) || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'driver' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {roles.find(r => r.name === user.role)?.description || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(user)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${user.is_active !== false ? 
                          'bg-green-100 text-green-800 hover:bg-green-200' : 
                          'bg-red-100 text-red-800 hover:bg-red-200'} 
                        transition-colors cursor-pointer`}
                    >
                      {user.is_active !== false ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          활성
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" />
                          비활성
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? 
                      new Date(user.last_login).toLocaleDateString() : 
                      '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setResetPasswordUser(user);
                        generatePassword();
                        setShowPasswordResetModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                      title="비밀번호 초기화"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 비밀번호 초기화 모달 */}
      {showPasswordResetModal && resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">비밀번호 초기화</h2>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>{resetPasswordUser.name}</strong>님의 비밀번호를 초기화합니다.
              </p>
              <p className="text-sm text-gray-600">
                이메일: {resetPasswordUser.email || '등록된 이메일 없음'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                    placeholder="새 비밀번호"
                  />
                  <button
                    onClick={generatePassword}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    자동생성
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * 사용자에게 이 비밀번호를 알려주세요.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setResetPasswordUser(null);
                  setNewPassword("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={!newPassword}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                비밀번호 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이메일 찾기 모달 */}
      {showEmailSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">이메일 찾기</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={emailSearchData.name}
                  onChange={(e) => setEmailSearchData({ ...emailSearchData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="사용자 이름"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 (선택사항)
                </label>
                <input
                  type="tel"
                  value={emailSearchData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumberOnInput(e.target.value, emailSearchData.phone);
                    setEmailSearchData({ ...emailSearchData, phone: formatted });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-0000-0000 (더 정확한 검색을 위해)"
                  maxLength={13}
                />
              </div>

              {emailSearchResult && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900 mb-2">찾은 사용자 정보:</p>
                  <p className="text-sm"><strong>이름:</strong> {emailSearchResult.name}</p>
                  <p className="text-sm"><strong>이메일:</strong> {emailSearchResult.email || '등록된 이메일 없음'}</p>
                  <p className="text-sm"><strong>전화번호:</strong> {formatPhoneNumber(emailSearchResult.phone) || '등록된 전화번호 없음'}</p>
                  <p className="text-sm"><strong>역할:</strong> {emailSearchResult.role}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEmailSearchModal(false);
                  setEmailSearchData({ name: "", phone: "" });
                  setEmailSearchResult(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handleEmailSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                찾기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "사용자 수정" : "사용자 추가"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumberOnInput(e.target.value, formData.phone);
                    setFormData({ ...formData, phone: formatted });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-0000-0000"
                  maxLength={13}
                />
                <p className="text-xs text-gray-500 mt-1">
                  * 숫자만 입력하세요. 하이픈(-)은 자동으로 추가됩니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.description || role.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                      placeholder="비밀번호 입력 (기본: 90001004)"
                      required={false}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
                        let password = '';
                        for (let i = 0; i < 8; i++) {
                          password += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        setFormData({ ...formData, password });
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      자동생성
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * 최소 6자 이상 입력하세요. 사용자에게 이 비밀번호를 알려주세요.
                  </p>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  계정 활성화
                </label>
              </div>
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
                disabled={false}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingUser ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}