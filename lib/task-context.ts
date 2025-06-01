import { createContext } from 'react'
import type { Paperwork } from '@/lib/types'

// Create a context for tasks with an empty array and a dummy setter function as default values
export const TasksContext = createContext<{
  tasks: Paperwork[]
  setTasks: React.Dispatch<React.SetStateAction<Paperwork[]>>
}>({
  tasks: [],
  setTasks: () => {},
})
