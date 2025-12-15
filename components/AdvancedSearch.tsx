"use client";

import { useState } from "react";

export type ComparisonOperator = 
  | "contains" 
  | "equals" 
  | "notEquals" 
  | "greaterThan" 
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual";

export type MatchType = "relative" | "absolute";

export interface SearchCondition {
  id: string;
  field: string;
  operator: ComparisonOperator;
  matchType: MatchType;
  value: string;
}

export interface AndGroup {
  id: string;
  conditions: SearchCondition[];
}

export interface SearchFilter {
  andGroups: AndGroup[];
  orGroups: AndGroup[]; // Điều kiện loại trừ
}

interface AdvancedSearchProps {
  fields: { value: string; label: string; type?: "string" | "number" | "date" }[];
  onApply: (filter: SearchFilter) => void;
  onClear: () => void;
}

export default function AdvancedSearch({ fields, onApply, onClear }: AdvancedSearchProps) {
  const [expanded, setExpanded] = useState(false);
  const [andGroups, setAndGroups] = useState<AndGroup[]>([
    { id: "and-1", conditions: [] },
  ]);
  const [orGroups, setOrGroups] = useState<AndGroup[]>([
    { id: "or-1", conditions: [] },
  ]);

  const operatorLabels: Record<ComparisonOperator, string> = {
    contains: "Chứa",
    equals: "Bằng",
    notEquals: "Không bằng",
    greaterThan: "Lớn hơn",
    lessThan: "Nhỏ hơn",
    greaterThanOrEqual: "Lớn hơn hoặc bằng",
    lessThanOrEqual: "Nhỏ hơn hoặc bằng",
  };

  const getOperators = (fieldType?: string): ComparisonOperator[] => {
    if (fieldType === "number") {
      return ["equals", "notEquals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual"];
    }
    if (fieldType === "date") {
      return ["equals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual"];
    }
    return ["contains", "equals", "notEquals"];
  };

  const addCondition = (groupId: string, isAndGroup: boolean) => {
    const newCondition: SearchCondition = {
      id: `cond-${Date.now()}-${Math.random()}`,
      field: fields[0]?.value || "",
      operator: "contains",
      matchType: "relative",
      value: "",
    };

    if (isAndGroup) {
      setAndGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, conditions: [...group.conditions, newCondition] }
            : group
        )
      );
    } else {
      setOrGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, conditions: [...group.conditions, newCondition] }
            : group
        )
      );
    }
  };

  const removeCondition = (groupId: string, conditionId: string, isAndGroup: boolean) => {
    if (isAndGroup) {
      setAndGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, conditions: group.conditions.filter((c) => c.id !== conditionId) }
            : group
        )
      );
    } else {
      setOrGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, conditions: group.conditions.filter((c) => c.id !== conditionId) }
            : group
        )
      );
    }
  };

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<SearchCondition>,
    isAndGroup: boolean
  ) => {
    if (isAndGroup) {
      setAndGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                conditions: group.conditions.map((c) =>
                  c.id === conditionId ? { ...c, ...updates } : c
                ),
              }
            : group
        )
      );
    } else {
      setOrGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                conditions: group.conditions.map((c) =>
                  c.id === conditionId ? { ...c, ...updates } : c
                ),
              }
            : group
        )
      );
    }
  };

  const addAndGroup = () => {
    setAndGroups((prev) => [...prev, { id: `and-${Date.now()}`, conditions: [] }]);
  };

  const removeAndGroup = (groupId: string) => {
    if (andGroups.length > 1) {
      setAndGroups((prev) => prev.filter((g) => g.id !== groupId));
    }
  };

  const handleApply = () => {
    // Filter out empty conditions
    const filteredAndGroups = andGroups
      .map((group) => ({
        ...group,
        conditions: group.conditions.filter((c) => c.value.trim() !== ""),
      }))
      .filter((group) => group.conditions.length > 0);

    const filteredOrGroups = orGroups
      .map((group) => ({
        ...group,
        conditions: group.conditions.filter((c) => c.value.trim() !== ""),
      }))
      .filter((group) => group.conditions.length > 0);

    onApply({
      andGroups: filteredAndGroups,
      orGroups: filteredOrGroups,
    });
  };

  const handleClear = () => {
    setAndGroups([{ id: "and-1", conditions: [] }]);
    setOrGroups([{ id: "or-1", conditions: [] }]);
    onClear();
  };

  const renderConditionGroup = (
    group: AndGroup,
    isAndGroup: boolean,
    showAndLabel: boolean = false
  ) => {
    const label = isAndGroup ? (showAndLabel ? "AND" : "") : "OR";
    
    return (
      <div key={group.id} className="mb-4">
        {label && (
          <div className="flex items-center mb-2">
            <span className="text-sm font-semibold text-gray-600 mr-2">{label}</span>
            {isAndGroup && group.id !== "and-1" && (
              <button
                onClick={() => removeAndGroup(group.id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Xóa nhóm
              </button>
            )}
          </div>
        )}
        {group.conditions.length === 0 ? (
          <button
            onClick={() => addCondition(group.id, isAndGroup)}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2"
          >
            + Thêm điều kiện
          </button>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 mb-2">
              <div className="col-span-2 text-sm font-medium text-gray-700">Thuộc tính</div>
              <div className="col-span-2 text-sm font-medium text-gray-700">Phép so sánh</div>
              <div className="col-span-2 text-sm font-medium text-gray-700">Loại</div>
              <div className="col-span-5 text-sm font-medium text-gray-700">Giá trị</div>
              <div className="col-span-1"></div>
            </div>
            {group.conditions.map((condition) => {
              const field = fields.find((f) => f.value === condition.field);
              const fieldType = field?.type || "string";
              
              return (
                <div key={condition.id} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-2">
                    <select
                      value={condition.field}
                      onChange={(e) =>
                        updateCondition(
                          group.id,
                          condition.id,
                          { field: e.target.value, operator: getOperators(fields.find((f) => f.value === e.target.value)?.type)[0] },
                          isAndGroup
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {fields.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <select
                      value={condition.operator}
                      onChange={(e) =>
                        updateCondition(
                          group.id,
                          condition.id,
                          { operator: e.target.value as ComparisonOperator },
                          isAndGroup
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {getOperators(fieldType).map((op) => (
                        <option key={op} value={op}>
                          {operatorLabels[op]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <select
                      value={condition.matchType}
                      onChange={(e) =>
                        updateCondition(
                          group.id,
                          condition.id,
                          { matchType: e.target.value as MatchType },
                          isAndGroup
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="relative">Tương đối</option>
                      <option value="absolute">Tuyệt đối</option>
                    </select>
                  </div>
                  <div className="col-span-5">
                    <input
                      type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
                      value={condition.value}
                      onChange={(e) =>
                        updateCondition(
                          group.id,
                          condition.id,
                          { value: e.target.value },
                          isAndGroup
                        )
                      }
                      placeholder="Nhập giá trị"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeCondition(group.id, condition.id, isAndGroup)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => addCondition(group.id, isAndGroup)}
              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              + Thêm điều kiện
            </button>
          </>
        )}
      </div>
    );
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1"
      >
        <span>Mở rộng tìm kiếm</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tìm kiếm nâng cao</h3>
        <button
          onClick={() => setExpanded(false)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <span>Thu gọn tìm kiếm</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>

      {/* Điều kiện thỏa mãn */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-700">Điều kiện thỏa mãn</h4>
          <button
            onClick={addAndGroup}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Thêm nhóm OR
          </button>
        </div>
        {andGroups.map((group, index) => (
          <div key={group.id}>
            {index > 0 && (
              <div className="my-3">
                <span className="text-sm font-semibold text-gray-600">OR</span>
              </div>
            )}
            {renderConditionGroup(group, true, index === 0)}
          </div>
        ))}
      </div>

      {/* Điều kiện loại trừ */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3">Điều kiện loại trừ</h4>
        {orGroups.map((group) => renderConditionGroup(group, false, false))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-4 border-t border-gray-300">
        <button
          onClick={handleClear}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
        >
          Xóa bộ lọc
        </button>
        <button
          onClick={handleApply}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}

