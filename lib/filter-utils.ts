type ComparisonOperator = 
  | "contains" 
  | "equals" 
  | "notEquals" 
  | "greaterThan" 
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual";

interface SearchCondition {
  field: string;
  operator: ComparisonOperator;
  matchType?: "relative" | "absolute";
  value: string;
}

export interface SearchFilter {
  andGroups: { conditions: SearchCondition[] }[];
  orGroups: { conditions: SearchCondition[] }[];
}

export function buildWhereClause(filter: SearchFilter | null, search?: string): any {
  const conditions: any[] = [];

  // Simple search (backward compatible)
  if (search && !filter) {
    conditions.push({
      OR: [
        { tenThuoc: { contains: search, mode: 'insensitive' as any } },
        { hoatChat: { contains: search, mode: 'insensitive' as any } },
        { tenCoSoSanXuat: { contains: search, mode: 'insensitive' as any } },
      ]
    });
  }

  // Advanced filter
  if (filter) {
    const andConditions: any[] = [];

    // Process AND groups
    // First group (index 0): conditions are AND'd together (dependent on each other)
    // Additional groups (index > 0): conditions are OR'd together within group
    filter.andGroups.forEach((group, groupIndex) => {
      if (group.conditions.length > 0) {
        const groupConditions = group.conditions.map((cond) => {
          const fieldMap: { [key: string]: string } = {
            tenThuoc: 'tenThuoc',
            hoatChat: 'hoatChat',
            hamLuong: 'hamLuong',
            gdklh: 'gdklh',
            duongDung: 'duongDung',
            dangBaoChe: 'dangBaoChe',
            tenCoSoSanXuat: 'tenCoSoSanXuat',
            nuocSanXuat: 'nuocSanXuat',
            quyCachDongGoi: 'quyCachDongGoi',
            donViTinh: 'donViTinh',
            soLuong: 'soLuong',
            donGia: 'donGia',
            nhomThuoc: 'nhomThuoc',
            tenDonViTrungThau: 'tenDonViTrungThau',
            tinh: 'tinh',
            tenNhaThau: 'tenNhaThau',
            soQuyetDinh: 'soQuyetDinh',
            ngayCongBo: 'ngayCongBo',
            loaiThuoc: 'loaiThuoc',
            maTT: 'maTT',
            maDuongDung: 'maDuongDung',
          };

          const dbField = fieldMap[cond.field] || cond.field;
          const value = cond.value.trim();

          if (!value) return null;

          const fieldType = ['soLuong', 'donGia'].includes(dbField) ? 'number' :
                           ['ngayCongBo'].includes(dbField) ? 'date' : 'string';

          let condition: any = {};

          if (fieldType === 'number') {
            const numValue = parseFloat(value.replace(/,/g, ''));
            if (isNaN(numValue)) return null;

            switch (cond.operator) {
              case 'equals':
                condition[dbField] = numValue.toString();
                break;
              case 'notEquals':
                condition[dbField] = { not: numValue.toString() };
                break;
              case 'greaterThan':
                condition[dbField] = { gt: numValue.toString() };
                break;
              case 'lessThan':
                condition[dbField] = { lt: numValue.toString() };
                break;
              case 'greaterThanOrEqual':
                condition[dbField] = { gte: numValue.toString() };
                break;
              case 'lessThanOrEqual':
                condition[dbField] = { lte: numValue.toString() };
                break;
              case 'contains':
                condition[dbField] = { contains: value, mode: 'insensitive' as any };
                break;
            }
          } else if (fieldType === 'date') {
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) return null;

            switch (cond.operator) {
              case 'equals':
                const startOfDay = new Date(dateValue);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(dateValue);
                endOfDay.setHours(23, 59, 59, 999);
                condition[dbField] = { gte: startOfDay, lte: endOfDay };
                break;
              case 'greaterThan':
                condition[dbField] = { gt: dateValue };
                break;
              case 'lessThan':
                condition[dbField] = { lt: dateValue };
                break;
              case 'greaterThanOrEqual':
                condition[dbField] = { gte: dateValue };
                break;
              case 'lessThanOrEqual':
                condition[dbField] = { lte: dateValue };
                break;
            }
          } else {
            // String fields
            const isAbsoluteVSS = cond.matchType === 'absolute';
            const modeVSS = isAbsoluteVSS ? undefined : 'insensitive' as any;
            
            switch (cond.operator) {
              case 'contains':
                condition[dbField] = modeVSS 
                  ? { contains: value, mode: modeVSS }
                  : { contains: value };
                break;
              case 'equals':
                condition[dbField] = modeVSS
                  ? { equals: value, mode: modeVSS }
                  : { equals: value };
                break;
              case 'notEquals':
                condition[dbField] = modeVSS
                  ? { not: { equals: value, mode: modeVSS } }
                  : { not: { equals: value } };
                break;
            }
          }

          return condition;
        }).filter((c) => c !== null);

        if (groupConditions.length > 0) {
          if (groupConditions.length === 1) {
            andConditions.push(groupConditions[0]);
          } else {
            // First group: AND conditions together (dependent)
            // Additional groups: OR conditions together
            if (groupIndex === 0) {
              andConditions.push({ AND: groupConditions });
            } else {
              andConditions.push({ OR: groupConditions });
            }
          }
        }
      }
    });

    // Process OR groups (exclusion conditions)
    if (filter.orGroups.length > 0) {
      const exclusionConditions: any[] = [];
      
      filter.orGroups.forEach((group) => {
        group.conditions.forEach((cond) => {
          const fieldMap: { [key: string]: string } = {
            tenThuoc: 'tenThuoc',
            hoatChat: 'hoatChat',
            hamLuong: 'hamLuong',
            gdklh: 'gdklh',
            duongDung: 'duongDung',
            dangBaoChe: 'dangBaoChe',
            tenCoSoSanXuat: 'tenCoSoSanXuat',
            nuocSanXuat: 'nuocSanXuat',
            quyCachDongGoi: 'quyCachDongGoi',
            donViTinh: 'donViTinh',
            soLuong: 'soLuong',
            donGia: 'donGia',
            nhomThuoc: 'nhomThuoc',
            tenDonViTrungThau: 'tenDonViTrungThau',
            tinh: 'tinh',
            tenNhaThau: 'tenNhaThau',
            soQuyetDinh: 'soQuyetDinh',
            ngayCongBo: 'ngayCongBo',
            loaiThuoc: 'loaiThuoc',
            maTT: 'maTT',
            maDuongDung: 'maDuongDung',
          };

          const dbField = fieldMap[cond.field] || cond.field;
          const value = cond.value.trim();

          if (!value) return;

          const fieldType = ['soLuong', 'donGia'].includes(dbField) ? 'number' :
                           ['ngayCongBo'].includes(dbField) ? 'date' : 'string';

          let condition: any = {};

          if (fieldType === 'number') {
            const numValue = parseFloat(value.replace(/,/g, ''));
            if (isNaN(numValue)) return;

            switch (cond.operator) {
              case 'equals':
                condition[dbField] = numValue.toString();
                break;
              case 'contains':
                const isAbsoluteNumEx = cond.matchType === 'absolute';
                condition[dbField] = isAbsoluteNumEx
                  ? { contains: value }
                  : { contains: value, mode: 'insensitive' as any };
                break;
              default:
                condition[dbField] = numValue.toString();
            }
          } else if (fieldType === 'date') {
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) return;
            condition[dbField] = dateValue;
          } else {
            const isAbsoluteEx = cond.matchType === 'absolute';
            const modeEx = isAbsoluteEx ? undefined : 'insensitive' as any;
            condition[dbField] = modeEx
              ? { contains: value, mode: modeEx }
              : { contains: value };
          }

          exclusionConditions.push(condition);
        });
      });

      if (exclusionConditions.length > 0) {
        andConditions.push({ NOT: { OR: exclusionConditions } });
      }
    }

    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        conditions.push(andConditions[0]);
      } else {
        // First group AND conditions, additional groups OR with first group result
        const firstGroup = andConditions[0];
        const additionalGroups = andConditions.slice(1);
        if (additionalGroups.length > 0) {
          conditions.push({
            OR: [firstGroup, ...additionalGroups]
          });
        } else {
          conditions.push(firstGroup);
        }
      }
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

export function buildWhereClauseMSC(filter: SearchFilter | null, search?: string): any {
  const conditions: any[] = [];

  // Simple search (backward compatible)
  if (search && !filter) {
    conditions.push({
      OR: [
        { tenThuoc: { contains: search, mode: 'insensitive' as any } },
        { hoatChat: { contains: search, mode: 'insensitive' as any } },
        { tenCoSoSanXuat: { contains: search, mode: 'insensitive' as any } },
      ]
    });
  }

  // Advanced filter
  if (filter) {
    const andConditions: any[] = [];

    // Process AND groups
    // First group (index 0): conditions are AND'd together (dependent on each other)
    // Additional groups (index > 0): conditions are OR'd together within group
    filter.andGroups.forEach((group, groupIndex) => {
      if (group.conditions.length > 0) {
        const groupConditions = group.conditions.map((cond) => {
          const fieldMap: { [key: string]: string } = {
            tenThuoc: 'tenThuoc',
            hoatChat: 'hoatChat',
            hamLuong: 'hamLuong',
            gdklh: 'gdklh',
            duongDung: 'duongDung',
            dangBaoChe: 'dangBaoChe',
            hanDung: 'hanDung',
            tenCoSoSanXuat: 'tenCoSoSanXuat',
            nuocSanXuat: 'nuocSanXuat',
            quyCachDongGoi: 'quyCachDongGoi',
            donViTinh: 'donViTinh',
            soLuong: 'soLuong',
            donGia: 'donGia',
            nhomThuoc: 'nhomThuoc',
            maTBMT: 'maTBMT',
            tenChuDauTu: 'tenChuDauTu',
            hinhThucLCNT: 'hinhThucLCNT',
            ngayDangTai: 'ngayDangTai',
            soQuyetDinh: 'soQuyetDinh',
            ngayBanHanhQuyetDinh: 'ngayBanHanhQuyetDinh',
            soNhaThauThamDu: 'soNhaThauThamDu',
            diaDiem: 'diaDiem',
          };

          const dbField = fieldMap[cond.field] || cond.field;
          const value = cond.value.trim();

          if (!value) return null;

          const fieldType = ['soLuong', 'donGia'].includes(dbField) ? 'number' :
                           ['ngayDangTai', 'ngayBanHanhQuyetDinh'].includes(dbField) ? 'date' : 'string';

          let condition: any = {};

          if (fieldType === 'number') {
            const numValue = parseFloat(value.replace(/,/g, ''));
            if (isNaN(numValue)) return null;

            switch (cond.operator) {
              case 'equals':
                condition[dbField] = numValue.toString();
                break;
              case 'notEquals':
                condition[dbField] = { not: numValue.toString() };
                break;
              case 'greaterThan':
                condition[dbField] = { gt: numValue.toString() };
                break;
              case 'lessThan':
                condition[dbField] = { lt: numValue.toString() };
                break;
              case 'greaterThanOrEqual':
                condition[dbField] = { gte: numValue.toString() };
                break;
              case 'lessThanOrEqual':
                condition[dbField] = { lte: numValue.toString() };
                break;
              case 'contains':
                const isAbsoluteNumMSC = cond.matchType === 'absolute';
                condition[dbField] = isAbsoluteNumMSC
                  ? { contains: value }
                  : { contains: value, mode: 'insensitive' as any };
                break;
            }
          } else if (fieldType === 'date') {
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) return null;

            switch (cond.operator) {
              case 'equals':
                const startOfDay = new Date(dateValue);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(dateValue);
                endOfDay.setHours(23, 59, 59, 999);
                condition[dbField] = { gte: startOfDay, lte: endOfDay };
                break;
              case 'greaterThan':
                condition[dbField] = { gt: dateValue };
                break;
              case 'lessThan':
                condition[dbField] = { lt: dateValue };
                break;
              case 'greaterThanOrEqual':
                condition[dbField] = { gte: dateValue };
                break;
              case 'lessThanOrEqual':
                condition[dbField] = { lte: dateValue };
                break;
            }
          } else {
            // String fields
            const isAbsoluteMSC = cond.matchType === 'absolute';
            const modeMSC = isAbsoluteMSC ? undefined : 'insensitive' as any;
            
            switch (cond.operator) {
              case 'contains':
                condition[dbField] = modeMSC 
                  ? { contains: value, mode: modeMSC }
                  : { contains: value };
                break;
              case 'equals':
                condition[dbField] = modeMSC
                  ? { equals: value, mode: modeMSC }
                  : { equals: value };
                break;
              case 'notEquals':
                condition[dbField] = modeMSC
                  ? { not: { equals: value, mode: modeMSC } }
                  : { not: { equals: value } };
                break;
            }
          }

          return condition;
        }).filter((c) => c !== null);

        if (groupConditions.length > 0) {
          if (groupConditions.length === 1) {
            andConditions.push(groupConditions[0]);
          } else {
            // First group: AND conditions together (dependent)
            // Additional groups: OR conditions together
            if (groupIndex === 0) {
              andConditions.push({ AND: groupConditions });
            } else {
              andConditions.push({ OR: groupConditions });
            }
          }
        }
      }
    });

    // Process OR groups (exclusion conditions)
    if (filter.orGroups.length > 0) {
      const exclusionConditions: any[] = [];
      
      filter.orGroups.forEach((group) => {
        group.conditions.forEach((cond) => {
          const fieldMap: { [key: string]: string } = {
            tenThuoc: 'tenThuoc',
            hoatChat: 'hoatChat',
            hamLuong: 'hamLuong',
            gdklh: 'gdklh',
            duongDung: 'duongDung',
            dangBaoChe: 'dangBaoChe',
            hanDung: 'hanDung',
            tenCoSoSanXuat: 'tenCoSoSanXuat',
            nuocSanXuat: 'nuocSanXuat',
            quyCachDongGoi: 'quyCachDongGoi',
            donViTinh: 'donViTinh',
            soLuong: 'soLuong',
            donGia: 'donGia',
            nhomThuoc: 'nhomThuoc',
            maTBMT: 'maTBMT',
            tenChuDauTu: 'tenChuDauTu',
            hinhThucLCNT: 'hinhThucLCNT',
            ngayDangTai: 'ngayDangTai',
            soQuyetDinh: 'soQuyetDinh',
            ngayBanHanhQuyetDinh: 'ngayBanHanhQuyetDinh',
            soNhaThauThamDu: 'soNhaThauThamDu',
            diaDiem: 'diaDiem',
          };

          const dbField = fieldMap[cond.field] || cond.field;
          const value = cond.value.trim();

          if (!value) return;

          const fieldType = ['soLuong', 'donGia'].includes(dbField) ? 'number' :
                           ['ngayDangTai', 'ngayBanHanhQuyetDinh'].includes(dbField) ? 'date' : 'string';

          let condition: any = {};

          if (fieldType === 'number') {
            const numValue = parseFloat(value.replace(/,/g, ''));
            if (isNaN(numValue)) return;

            switch (cond.operator) {
              case 'equals':
                condition[dbField] = numValue.toString();
                break;
              case 'contains':
                const isAbsoluteNumMSCEx = cond.matchType === 'absolute';
                condition[dbField] = isAbsoluteNumMSCEx
                  ? { contains: value }
                  : { contains: value, mode: 'insensitive' as any };
                break;
              default:
                condition[dbField] = numValue.toString();
            }
          } else if (fieldType === 'date') {
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) return;
            condition[dbField] = dateValue;
          } else {
            const isAbsoluteMSCEx = cond.matchType === 'absolute';
            const modeMSCEx = isAbsoluteMSCEx ? undefined : 'insensitive' as any;
            condition[dbField] = modeMSCEx
              ? { contains: value, mode: modeMSCEx }
              : { contains: value };
          }

          exclusionConditions.push(condition);
        });
      });

      if (exclusionConditions.length > 0) {
        andConditions.push({ NOT: { OR: exclusionConditions } });
      }
    }

    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        conditions.push(andConditions[0]);
      } else {
        // First group AND conditions, additional groups OR with first group result
        const firstGroup = andConditions[0];
        const additionalGroups = andConditions.slice(1);
        if (additionalGroups.length > 0) {
          conditions.push({
            OR: [firstGroup, ...additionalGroups]
          });
        } else {
          conditions.push(firstGroup);
        }
      }
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

