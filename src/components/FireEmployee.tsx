import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { AlertTriangle, User } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function FireEmployee() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [notes, setNotes] = useState('');

  const employees = [
    { id: 'EMP-001', name: 'John Smith', department: 'Engineering', position: 'Senior Developer' },
    { id: 'EMP-002', name: 'Sarah Johnson', department: 'Marketing', position: 'Marketing Manager' },
    { id: 'EMP-003', name: 'Michael Brown', department: 'Sales', position: 'Sales Representative' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Separation data:', { selectedEmployee, reason, lastWorkingDay, notes });
    // Handle separation
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl tracking-tight">Separate Employee</h1>
        <p className="text-gray-500 mt-1">Process employee separation from the organization</p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This action will move the employee to separated status. They will no longer have access
          to the attendance system. This action can be reversed from the Separated Employees section.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Employee */}
          <div>
            <Label>Select Employee</Label>
            <div className="mt-2 space-y-2">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setSelectedEmployee(employee.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedEmployee === employee.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p>{employee.name}</p>
                      <p className="text-sm text-gray-500">
                        {employee.position} - {employee.department}
                      </p>
                      <p className="text-sm text-gray-500">{employee.id}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedEmployee && (
            <>
              {/* Separation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reason">Reason for Separation</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Resignation, Termination"
                  />
                </div>
                <div>
                  <Label htmlFor="lastWorkingDay">Last Working Day</Label>
                  <Input
                    id="lastWorkingDay"
                    type="date"
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional information about the separation..."
                  rows={4}
                />
              </div>

              {/* Checklist */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-3">Exit Checklist</h3>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Return of company property</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Final settlement processed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Access credentials revoked</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Exit interview completed</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="submit" variant="destructive">
                  Process Separation
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}
