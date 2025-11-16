import api from './api';

// Types for attendance data
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  date: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  hoursWorked?: number;
  notes?: string;
}

export interface AttendanceFilters {
  employeeId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceRecord['status'];
  page?: number;
  limit?: number;
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  lateToday: number;
  attendanceRate: number;
}

export interface CheckInData {
  employeeId: string;
  timestamp?: string; // Optional, defaults to now
  location?: {
    latitude?: number;
    longitude?: number;
  };
  deviceInfo?: string;
}

export interface CheckOutData {
  employeeId: string;
  timestamp?: string; // Optional, defaults to now
  notes?: string;
}

// Attendance Service Class
export class AttendanceService {
  private readonly baseUrl = '/attendance';

  /**
   * Get attendance records with optional filtering
   */
  async getAttendanceRecords(filters: AttendanceFilters = {}): Promise<{
    data: AttendanceRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get<{
      data: AttendanceRecord[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(this.baseUrl, { params: filters });
    return response.data;
  }

  /**
   * Get attendance statistics for dashboard
   */
  async getAttendanceStats(date?: string): Promise<AttendanceStats> {
    const params = date ? { date } : {};
    const response = await api.get<AttendanceStats>(`${this.baseUrl}/stats`, { params });
    return response.data;
  }

  /**
   * Get attendance record for a specific employee and date
   */
  async getEmployeeAttendance(employeeId: string, date: string): Promise<AttendanceRecord | null> {
    try {
      const response = await api.get<AttendanceRecord>(`${this.baseUrl}/employee/${employeeId}`, {
        params: { date }
      });
      return response.data as AttendanceRecord;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No attendance record for this date
      }
      throw error;
    }
  }

  /**
   * Check in an employee
   */
  async checkIn(data: CheckInData): Promise<AttendanceRecord> {
    const { data: record } = await api.post<AttendanceRecord>(`${this.baseUrl}/check-in`, data);
    return record;
  }

  /**
   * Check out an employee
   */
  async checkOut(data: CheckOutData): Promise<AttendanceRecord> {
    const { data: record } = await api.post<AttendanceRecord>(`${this.baseUrl}/check-out`, data);
    return record;
  }

  /**
   * Manually mark attendance (admin/manager function)
   */
  async markAttendance(attendanceData: {
    employeeId: string;
    date: string;
    status: AttendanceRecord['status'];
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }): Promise<AttendanceRecord> {
    const { data: record } = await api.post<AttendanceRecord>(`${this.baseUrl}/mark`, attendanceData);
    return record;
  }

  /**
   * Update existing attendance record
   */
  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const { data: record } = await api.patch<AttendanceRecord>(`${this.baseUrl}/${id}`, updates);
    return record;
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get department-wise attendance summary
   */
  async getDepartmentSummary(date?: string): Promise<Array<{
    department: string;
    totalEmployees: number;
    present: number;
    absent: number;
    onLeave: number;
    attendanceRate: number;
  }>> {
    const params = date ? { date } : {};
    const { data } = await api.get<Array<{
      department: string;
      totalEmployees: number;
      present: number;
      absent: number;
      onLeave: number;
      attendanceRate: number;
    }>>(`${this.baseUrl}/departments/summary`, { params });
    return data;
  }

  /**
   * Generate attendance report
   */
  async generateReport(filters: {
    startDate: string;
    endDate: string;
    employeeIds?: string[];
    departments?: string[];
    format?: 'json' | 'csv' | 'excel';
  }): Promise<Blob | any> {
    const response = await api.post(`${this.baseUrl}/reports`, filters, {
      responseType: filters.format === 'json' ? 'json' : 'blob'
    });
    return response.data;
  }

  /**
   * Get attendance trends/analytics
   */
  async getAttendanceTrends(period: 'week' | 'month' | 'quarter', departmentId?: string): Promise<{
    labels: string[];
    present: number[];
    absent: number[];
    onLeave: number[];
    late: number[];
  }> {
    const params = { period, ...(departmentId && { departmentId }) };
    const { data } = await api.get<{
      labels: string[];
      present: number[];
      absent: number[];
      onLeave: number[];
      late: number[];
    }>(`${this.baseUrl}/trends`, { params });
    return data;
  }

  /**
   * Bulk check-in (for admin/manager importing attendance)
   */
  async bulkCheckIn(records: Array<{
    employeeId: string;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    status?: AttendanceRecord['status'];
    notes?: string;
  }>): Promise<{
    success: AttendanceRecord[];
    failed: Array<{ record: any; error: string }>;
  }> {
    const { data } = await api.post<{
      success: AttendanceRecord[];
      failed: Array<{ record: any; error: string }>;
    }>(`${this.baseUrl}/bulk-import`, { records });
    return data;
  }
}

// Export singleton instance
export const attendanceService = new AttendanceService();

// Export default for convenience
export default attendanceService;