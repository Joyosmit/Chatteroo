'use client'

import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

const TaskPage = () => {
    const tasks = useQuery(api.tasks.getTasks)
    const deleteTask = useMutation(api.tasks.deleteTask)
    return (
        <div className="p-10 flex flex-col gap-4">
            <h1 className="text-5xl">All the tasks are realtime</h1>
            {tasks?.map((task)=>(
                <div key={task._id} className="flex gap-2">
                    <span>{task.text}</span>
                    <div className={`w-10 h-10 ${task.completed?'bg-green-400':'bg-red-500'}`}></div>
                    <button
                    onClick={async()=>{
                        await deleteTask({id:task._id})
                    }}
                    className="bg-red-500 rounded-md p-3 text-white">
                        Delete task
                    </button>
                </div>
            ))}
        </div>
    )
}

export default TaskPage
