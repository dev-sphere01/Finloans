import React from 'react'

const TopTiles = ({Clock4, CalendarCheck, ThumbsUp, Tile, data }) => {
  return (
     <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-5">
          <Tile
            title="Total Hours (Month)"
            value={data.attendance.hoursMonth + "h"}
            icon={<Clock4 className="text-slate-500" />}
            color="bg-slate-100"
            hint={`Week: ${data.attendance.hoursWeek}h`}
          />
          <Tile
            title="Pending Leaves"
            value={data.pendingLeaves}
            icon={<CalendarCheck className="text-green-600" />}
            color="bg-green-100"
            hint={`${data.leavesTaken} used`}
          />
          <Tile
            title="Performance"
            value={data.performanceRating + " ★"}
            icon={<ThumbsUp className="text-purple-400" />}
            color="bg-purple-50"
            hint="Last review"
          />
        </div>
  )
}

export default TopTiles