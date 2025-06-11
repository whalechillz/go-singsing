
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* 일정 관리 헤더 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Route className="w-5 h-5 text-gray-600" />
                    여정 관리
                  </h2>
                  {formData.start_date && formData.end_date && (
                    <>
                      {formData.quote_data.schedules.length === 0 && (
                        <button
                          type="button"
                          onClick={initializeSchedules}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          일정 생성
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                {(!formData.start_date || !formData.end_date) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      일정을 관리하려면 먼저 기본 정보 탭에서 출발일과 도착일을 선택해주세요.
                    </p>
                  </div>
                )}
              </div>

              {/* 일정별 여정 관리 */}
              {formData.quote_data.schedules.map((daySchedule, dayIndex) => (
                <div key={dayIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <button
                      type="button"
                      onClick={() => toggleDayExpansion(dayIndex)}
                      className="w-full flex items-center justify-between"
                    >
                      <h3 className="font-medium text-gray-900 text-lg">
                        {daySchedule.title} ({daySchedule.date})
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {daySchedule.items.length}개 일정
                        </span>
                        {expandedDays.includes(dayIndex) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {expandedDays.includes(dayIndex) && (
                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        {daySchedule.items.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-8">
                            일정이 없습니다. 아래에서 장소를 선택해 추가하세요.
                          </p>
                        ) : (
                          daySchedule.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                              <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-sm font-medium text-gray-600">{itemIndex + 1}</span>
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="time"
                                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                                    value={item.time}
                                    onChange={(e) => updateScheduleItem(dayIndex, itemIndex, { time: e.target.value })}
                                  />
                                  {getIconForItem(item)}
                                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                                  {(item.spot?.category || item.attraction?.category) && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      item.spot?.category === 'boarding' || item.attraction?.category === 'boarding' ? 'bg-blue-100 text-blue-700' :
                                      item.spot?.category === 'tourist_spot' || item.attraction?.category === 'tourist_spot' ? 'bg-blue-100 text-blue-700' :
                                      item.spot?.category === 'rest_area' || item.attraction?.category === 'rest_area' ? 'bg-gray-100 text-gray-700' :
                                      item.spot?.category === 'restaurant' || item.attraction?.category === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                                      item.spot?.category === 'shopping' || item.attraction?.category === 'shopping' ? 'bg-purple-100 text-purple-700' :
                                      item.spot?.category === 'activity' || item.attraction?.category === 'activity' ? 'bg-green-100 text-green-700' :
                                      'bg-slate-100 text-slate-700'
                                    }`}>
                                      {categoryConfig[item.spot?.category || item.attraction?.category || 'others']?.label}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex gap-4">
                                  <input
                                    type="text"
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                    value={item.duration || ''}
                                    onChange={(e) => updateScheduleItem(dayIndex, itemIndex, { duration: e.target.value })}
                                    placeholder="소요시간 (예: 30분)"
                                  />
                                  <input
                                    type="text"
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                    value={item.note || ''}
                                    onChange={(e) => updateScheduleItem(dayIndex, itemIndex, { note: e.target.value })}
                                    placeholder="메모"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => moveScheduleItem(dayIndex, itemIndex, 'up')}
                                  disabled={itemIndex === 0}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="위로 이동"
                                >
                                  <ChevronDown className="w-4 h-4 rotate-180" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveScheduleItem(dayIndex, itemIndex, 'down')}
                                  disabled={itemIndex === daySchedule.items.length - 1}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="아래로 이동"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeScheduleItem(dayIndex, itemIndex)}
                                  className="p-1 hover:bg-gray-200 rounded text-red-500"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* 장소 추가 섹션 */}
                      <div className="border-t pt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">장소 추가하기</h4>
                        
                        {/* 탑승지 */}
                        {touristAttractions.filter(a => a.category === 'boarding').length > 0 && (
                          <div className="mb-6">
                            <h5 className="text-xs font-medium text-gray-600 mb-3 flex items-center gap-2">
                              <Bus className="w-4 h-4" />
                              탑승지
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {touristAttractions.filter(a => a.category === 'boarding').map(attraction => (
                                <button
                                  key={attraction.id}
                                  type="button"
                                  onClick={() => addScheduleItem(dayIndex, attraction)}
                                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                                >
                                  <p className="font-medium text-sm text-gray-900">{attraction.name}</p>
                                  {attraction.address && (
                                    <p className="text-xs text-gray-500 mt-1">{attraction.address}</p>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 관광지/스팟 */}
                        {touristAttractions.filter(a => a.category !== 'boarding').length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              관광지/스팟
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {touristAttractions.filter(a => a.category !== 'boarding').map(attraction => (
                                <button
                                  key={attraction.id}
                                  type="button"
                                  onClick={() => addScheduleItem(dayIndex, attraction)}
                                  className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    {React.createElement(categoryConfig[attraction.category]?.icon || MoreHorizontal, { 
                                      className: `w-4 h-4 ${
                                        attraction.category === 'tourist_spot' ? 'text-blue-500' :
                                        attraction.category === 'restaurant' ? 'text-orange-500' :
                                        attraction.category === 'shopping' ? 'text-purple-500' :
                                        attraction.category === 'activity' ? 'text-green-500' :
                                        'text-gray-500'
                                      }`
                                    })}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      attraction.category === 'tourist_spot' ? 'bg-blue-100 text-blue-700' :
                                      attraction.category === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                                      attraction.category === 'shopping' ? 'bg-purple-100 text-purple-700' :
                                      attraction.category === 'activity' ? 'bg-green-100 text-green-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {categoryConfig[attraction.category]?.label}
                                    </span>
                                  </div>
                                  <p className="font-medium text-sm text-gray-900">{attraction.name}</p>
                                  {attraction.address && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{attraction.address}</p>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 mt-6">
            <Link
              href="/admin/quotes"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}