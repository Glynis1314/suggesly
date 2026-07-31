const mongoose = require('mongoose');

const TASK_TYPE_OPTIONS = ['To-do', 'Call', 'Email', 'Meeting'];
const PRIORITY_OPTIONS = ['None', 'Low', 'Medium', 'High'];
const STATUS_OPTIONS = ['Open', 'Completed'];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Task title is required.'], trim: true },
    taskType: { type: String, enum: TASK_TYPE_OPTIONS, default: 'To-do' },
    priority: { type: String, enum: PRIORITY_OPTIONS, default: 'None' },
    status: { type: String, enum: STATUS_OPTIONS, default: 'Open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    queue: { type: String, default: '' },
    dueDate: { type: Date },
    reminder: { type: String, default: 'No reminder' },
    repeat: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    // Polymorphic associations — a task can relate to any mix of these
    associatedDeals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deal' }],
    associatedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
    associatedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
Task.TASK_TYPE_OPTIONS = TASK_TYPE_OPTIONS;
Task.PRIORITY_OPTIONS = PRIORITY_OPTIONS;
Task.STATUS_OPTIONS = STATUS_OPTIONS;
module.exports = Task;
