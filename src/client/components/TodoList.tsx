import { useState, type SVGProps } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Tabs from '@radix-ui/react-tabs'
import { useQueryClient } from '@tanstack/react-query'
import { useAutoAnimate } from '@formkit/auto-animate/react'

import { api } from '@/utils/client/api'

export const statuses = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

export const TodoList = () => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const queryClient = useQueryClient()
  const [parent] = useAutoAnimate<HTMLUListElement>()

  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: selectedStatus === "all"
      ? ['completed', 'pending']
      : selectedStatus === "pending"
        ? ['pending']
        : ['completed'],

  })

  const updateTodoStatus = api.todoStatus.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        api.todo.getAll.getQueryKey({
          statuses: selectedStatus === "all"
            ? ['completed', 'pending']
            : selectedStatus === "pending"
              ? ['pending']
              : ['completed'],
        })
      )
    }
  })

  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        api.todo.getAll.getQueryKey({
          statuses: selectedStatus === "all"
            ? ['completed', 'pending']
            : selectedStatus === "pending"
              ? ['pending']
              : ['completed'],
        })
      )
    }
  })

  const handleDelete = (todoId: number) => {
    deleteTodo.mutate({ id: todoId })
  };

  const handleCheckboxChange = (todoId: number, isChecked: boolean) => {
    const status = isChecked ? 'completed' : 'pending'
    updateTodoStatus.mutate({ todoId, status })
  };

  return (
    <>
      <Tabs.Root value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
        <Tabs.List className="flex gap-2 mb-10">
          {statuses.map((status) => (
            <Tabs.Trigger
              key={status.value}
              value={status.value}
              className={`px-6 py-3 rounded-full border font-bold ${selectedStatus === status.value
                ? 'text-white bg-gray-700 border-gray-700'
                : 'text-gray-700 border-gray-200'
                }`}
            >
              {status.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value={selectedStatus}>
          <ul ref={parent} className="grid grid-cols-1 gap-y-3">
            {todos.map((todo) => (
              <li key={todo.id}>
                <div className={`flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm ${todo.status === 'completed' ? 'bg-gray-50' : ''}`}>
                  <Checkbox.Root
                    id={String(todo.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                    checked={todo.status === 'completed'}
                    onCheckedChange={(checked) => handleCheckboxChange(todo.id, Boolean(checked))}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <div className='flex flex-1 gap-x-2 justify-between items-center'>
                    <label
                      className={`block pl-3 font-medium text-base ${todo.status === 'completed' ? 'line-through text-gray-500' : ''}`}
                      htmlFor={String(todo.id)}
                    >
                      {todo.body}
                    </label>
                    <button
                      type='button'
                      onClick={() => handleDelete(todo.id)}
                      aria-label="Delete"
                    >
                      <XMarkIcon className="h-6 w-6 text-base text-gray-700" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
};

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
