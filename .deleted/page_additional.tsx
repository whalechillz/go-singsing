

              {/* 기본 정보 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  기본 정보
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      투어 상품 선택
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.tour_product_id}
                      onChange={(e) => handleProductChange(e.target.value)}
                    >
                      <option value="">직접 입력</option>
                      {tourProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.golf_course})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      견적서 제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="예: 2025년 6월 제주도 골프투어 견적서"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      출발일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      도착일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      min={formData.start_date}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      1인 요금 (원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      placeholder="900000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      예상 인원
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.quote_data.participants.estimated_count}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        max_participants: parseInt(e.target.value) || 20,
                        quote_data: {
                          ...prev.quote_data,
                          participants: {
                            ...prev.quote_data.participants,
                            estimated_count: parseInt(e.target.value) || 20
                          }
                        }
                      }))}
                    />
                  </div>
                </div>

                {duration.days > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>{duration.nights}박 {duration.days}일</strong> 일정 • 
                      총 예상 금액: <strong>{(formData.price * formData.quote_data.participants.estimated_count).toLocaleString()}원</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* 고객 정보 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  고객 정보
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      고객명
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="홍길동"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                      placeholder="010-1234-5678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      단체명
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.quote_data.participants.group_name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        quote_data: {
                          ...prev.quote_data,
                          participants: {
                            ...prev.quote_data.participants,
                            group_name: e.target.value
                          }
                        }
                      }))}
                      placeholder="○○ 동호회"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      총무
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.quote_data.participants.leader_name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        quote_data: {
                          ...prev.quote_data,
                          participants: {
                            ...prev.quote_data.participants,
                            leader_name: e.target.value
                          }
                        }
                      }))}
                      placeholder="김총무"
                    />
                  </div>
                </div>
              </div>

              {/* 포함/불포함 사항 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  포함/불포함 사항
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">포함 사항</h3>
                      <button
                        type="button"
                        onClick={handleIncludeAdd}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4 inline" /> 추가
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.quote_data.includeExclude.includes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-gray-700">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeInclude(index)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">불포함 사항</h3>
                      <button
                        type="button"
                        onClick={handleExcludeAdd}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4 inline" /> 추가
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.quote_data.includeExclude.excludes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeExclude(index)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 견적 설정 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  견적 설정
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      견적 유효기간 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.quote_expires_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, quote_expires_at: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    추가 안내사항
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={formData.quote_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, quote_notes: e.target.value }))}
                    placeholder="견적서에 포함될 추가 안내사항을 입력하세요."
                  />
                </div>
              </div>
            </div>
          )}