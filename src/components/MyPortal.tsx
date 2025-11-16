import { Card } from './ui/card';
import { User, Calendar, Clock, Award } from 'lucide-react';
import { Button } from './ui/button';

export function MyPortal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl tracking-tight">My Portal</h1>
        <p className="text-gray-500 mt-1">View your personal attendance and leave information</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User className="w-12 h-12 text-gray-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl mb-1">John Smith</h2>
            <p className="text-gray-500 mb-1">Senior Developer - Engineering</p>
            <p className="text-sm text-gray-500">EMP-001 • john.smith@company.com</p>
            <div className="flex gap-2 mt-4">
              <Button size="sm">Edit Profile</Button>
              <Button size="sm" variant="outline">Change Password</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-3xl mt-2">98%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Days Present</p>
              <p className="text-3xl mt-2">22</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Work Hours</p>
              <p className="text-3xl mt-2">9.2h</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Leave Balance</p>
              <p className="text-3xl mt-2">12</p>
              <p className="text-xs text-gray-500 mt-1">Days remaining</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl mb-4">Recent Attendance</h2>
          <div className="space-y-3">
            {[
              { date: '2025-10-24', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'On Time' },
              { date: '2025-10-23', checkIn: '09:22 AM', checkOut: '06:45 PM', status: 'On Time' },
              { date: '2025-10-22', checkIn: '09:18 AM', checkOut: '06:25 PM', status: 'On Time' },
              { date: '2025-10-21', checkIn: '10:05 AM', checkOut: '07:10 PM', status: 'Late' },
            ].map((record, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    record.status === 'On Time' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {record.status}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>In: {record.checkIn}</span>
                  <span>Out: {record.checkOut}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl mb-4">Leave History</h2>
          <div className="space-y-3">
            {[
              { type: 'Sick Leave', from: '2025-09-15', to: '2025-09-16', status: 'Approved' },
              { type: 'Vacation', from: '2025-08-01', to: '2025-08-05', status: 'Approved' },
              { type: 'Personal', from: '2025-07-12', to: '2025-07-12', status: 'Approved' },
            ].map((leave, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span>{leave.type}</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    {leave.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(leave.from).toLocaleDateString()} - {new Date(leave.to).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">Request Leave</Button>
        </Card>
      </div>
    </div>
  );
}
