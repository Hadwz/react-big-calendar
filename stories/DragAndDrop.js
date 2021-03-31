import React, { useState, useCallback } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import { events, Views, DragAndDropCalendar } from './helpers'
import customComponents from './helpers/customComponents'
import * as dates from '../src/utils/dates'

storiesOf('Drag and Drop', module)
  .add('draggable and resizable', () => {
    return (
      <DragAndDropCalendar
        defaultDate={new Date()}
        defaultView={Views.WEEK}
        events={events}
        resizable
        onEventDrop={action('event dropped')}
        onEventResize={action('event resized')}
      />
    )
  })
  .add('draggable and resizable with non-default steps and timeslots', () => {
    return (
      <DragAndDropCalendar
        defaultDate={new Date()}
        defaultView={Views.WEEK}
        events={events}
        resizable
        step={15}
        timeslots={4}
        onEventDrop={action('event dropped')}
        onEventResize={action('event resized')}
      />
    )
  })
  .add('draggable and resizable with showMultiDayTimes', () => {
    return (
      <DragAndDropCalendar
        defaultDate={new Date()}
        defaultView={Views.WEEK}
        events={events}
        resizable
        showMultiDayTimes
        onEventDrop={action('event dropped')}
        onEventResize={action('event resized')}
      />
    )
  })
  .add('draggable and resizable with custom dateCellWrapper', () => {
    return (
      <DragAndDropCalendar
        components={{
          dateCellWrapper: customComponents.dateCellWrapper,
        }}
        defaultDate={new Date()}
        defaultView={Views.MONTH}
        events={events}
        resizable
        showMultiDayTimes
        onEventDrop={action('event dropped')}
        onEventResize={action('event resized')}
      />
    )
  })
  .add('draggable and resizable with custom timeSlotWrapper', () => {
    return (
      <DragAndDropCalendar
        components={{
          timeSlotWrapper: customComponents.timeSlotWrapper,
        }}
        defaultDate={new Date()}
        defaultView={Views.WEEK}
        events={events}
        resizable
        showMultiDayTimes
        onEventDrop={action('event dropped')}
        onEventResize={action('event resized')}
      />
    )
  })
  .add('draggable and resizable with custom eventWrapper', () => {
    return (
      <DragAndDropCalendar
        components={{
          eventWrapper: customComponents.eventWrapper,
        }}
        defaultDate={new Date()}
        defaultView={Views.WEEK}
        events={events}
        resizable
        showMultiDayTimes
        onEventDrop={action('event dropped')}
        onEventResize={action('event resized')}
      />
    )
  })
  .add('test day view', () => {
    const date = new Date()
    const month = date.getMonth()
    const today = date.getDate()
    const propsEvents = [
      {
        id: 1,
        title: 'A',
        resourceId: 'a',
        start: new Date(2021, month, today, 9, 0),
        end: new Date(2021, month, today, 10, 0),
      },
      {
        id: 2,
        title: 'B',
        resourceId: 'a',
        start: new Date(2021, month, today, 13, 0),
        end: new Date(2021, month, today, 14, 0),
      },
    ]
    const [events, setEvents] = useState(propsEvents.map(e => ({ ...e })))
    const [draggedEvent, setDraggedEvent] = useState(null)
    const [displayDragItemInCell, setdisplayDragItemInCell] = useState(true)

    const onSelectSlot = slotInfo => {
      const newEvent = {
        id: 0,
        title: 'new Event',
        resourceId: slotInfo.resourceId,
        start: slotInfo.start,
        end: slotInfo.end,
      }

      let nextEvent = [...events.filter(e => e.id === 0), newEvent]

      setEvents(nextEvent)
    }

    //TODO: 计算优化
    //可以在拖动/拖拽开始的时候，计算出该event的可活动范围，然后再进行限制，从而减少每次的计算量
    const inEventRange = (nextStart, nextEnd, currentEvent, events) => {
      return events.some(event => {
        if (currentEvent.id !== event.id) {
          //如果新的开始/结束时间在已存在的事件中范围内
          if (
            dates.inRange(nextEnd, event.start, event.end, 'minutes') ||
            dates.inRange(nextStart, event.start, event.end, 'minutes')
          ) {
            return true
          }

          //如果已存在的事件在新的事件的时间范围内
          if (
            dates.inRange(event.start, nextStart, nextEnd, 'minutes') ||
            dates.inRange(event.end, nextStart, nextEnd, 'minutes')
          ) {
            return true
          }
        }

        return false
      })
    }

    const onResizing = useCallback(
      (nextStart, nextEnd, resizingEvent) => {
        const inRange = inEventRange(nextStart, nextEnd, resizingEvent, events)

        return inRange !== true
      },
      [events]
    )
    const onResizeEvent = ({ event, start, end }) => {
      const nextEvents = events.map(existingEvent => {
        return existingEvent.id === event.id
          ? { ...existingEvent, start, end }
          : existingEvent
      })

      setEvents(nextEvents)
    }
    const handleDragStart = event => {
      setDraggedEvent(event)
    }

    const handleNotPointInColumn = useCallback(() => {
      return
    }, [])

    const moveEvent = ({
      event,
      start,
      end,
      isAllDay: droppedOnAllDaySlot,
    }) => {
      let allDay = event.allDay

      if (!event.allDay && droppedOnAllDaySlot) {
        allDay = true
      } else if (event.allDay && !droppedOnAllDaySlot) {
        allDay = false
      }

      const nextEvents = events.map(existingEvent => {
        return existingEvent.id == event.id
          ? { ...existingEvent, start, end, allDay }
          : existingEvent
      })

      setEvents(nextEvents)
      // alert(`${event.title} was dropped onto ${updatedEvent.start}`)
    }
    const onMoving = useCallback(
      (nextStart, nextEnd, movingEvent) => {
        const inRange = inEventRange(nextStart, nextEnd, movingEvent, events)

        return inRange !== true
      },
      [events]
    )

    return (
      <div
        className="ys-calendar-meetings"
        onContextMenu={e => e.preventDefault()}
      >
        <DragAndDropCalendar
          toolbar={false}
          events={events}
          resources={[
            {
              id: 'a',
              title: 'Room A',
            },
          ]}
          defaultView={'day'}
          step={15}
          timeslots={4}
          min={new Date(2021, month, today, 8, 45)}
          max={new Date(2021, month, today, 23, 0)}
          scrollToTime={new Date(2021, month, date.getHours(), 0)}
          formats={{
            timeGutterFormat: 'H',
          }}
          showAllDay={false}
          onSelectSlot={onSelectSlot}
          onEventDrop={moveEvent}
          onEventResize={onResizeEvent}
          onDragStart={handleDragStart}
          handleDragStart={handleDragStart}
          onMoving={onMoving}
          onResizing={onResizing}
          handleNotPointInColumn={handleNotPointInColumn}
        />
      </div>
    )
  })
  .add('test metting views', () => {
    const date = new Date()
    const month = date.getMonth()
    const today = date.getDate()
    const propsEvents = [
      {
        id: 1,
        title: 'A',
        resourceId: 'a',
        start: new Date(2021, month, today, 9, 0),
        end: new Date(2021, month, today, 10, 0),
      },
      {
        id: 2,
        title: 'B',
        resourceId: 'b',
        start: new Date(2021, month, today, 13, 0),
        end: new Date(2021, month, today, 14, 0),
      },
    ]
    const [events, setEvents] = useState(propsEvents.map(e => ({ ...e })))
    const [draggedEvent, setDraggedEvent] = useState(null)
    const [displayDragItemInCell, setdisplayDragItemInCell] = useState(true)

    const onSelectSlot = slotInfo => {
      const newEvent = {
        id: 0,
        title: 'new Event',
        resourceId: slotInfo.resourceId,
        start: slotInfo.start,
        end: slotInfo.end,
      }

      let nextEvent = [...events.filter(e => e.id === 0), newEvent]

      setEvents(nextEvent)
    }

    //TODO: 计算优化
    //可以在拖动/拖拽开始的时候，计算出该event的可活动范围，然后再进行限制，从而减少每次的计算量
    const inEventRange = (nextStart, nextEnd, currentEvent, events) => {
      return events.some(event => {
        if (
          currentEvent.resourceId === event.resourceId &&
          currentEvent.id !== event.id
        ) {
          //如果新的开始/结束时间在已存在的事件中范围内
          if (
            dates.inRange(nextEnd, event.start, event.end, 'minutes') ||
            dates.inRange(nextStart, event.start, event.end, 'minutes')
          ) {
            return true
          }

          //如果已存在的事件在新的事件的时间范围内
          if (
            dates.inRange(event.start, nextStart, nextEnd, 'minutes') ||
            dates.inRange(event.end, nextStart, nextEnd, 'minutes')
          ) {
            return true
          }
        }

        return false
      })
    }

    const onResizing = useCallback(
      (nextStart, nextEnd, resizingEvent) => {
        const inRange = inEventRange(nextStart, nextEnd, resizingEvent, events)

        return inRange !== true
      },
      [events]
    )
    const onResizeEvent = ({ event, start, end }) => {
      const nextEvents = events.map(existingEvent => {
        return existingEvent.id === event.id
          ? { ...existingEvent, start, end }
          : existingEvent
      })

      setEvents(nextEvents)
    }
    const handleDragStart = event => {
      setDraggedEvent(event)
    }

    const handleNotPointInColumn = useCallback(dragAction => {
      return
    }, [])

    const moveEvent = ({
      event,
      start,
      end,
      isAllDay: droppedOnAllDaySlot,
    }) => {
      let allDay = event.allDay

      if (!event.allDay && droppedOnAllDaySlot) {
        allDay = true
      } else if (event.allDay && !droppedOnAllDaySlot) {
        allDay = false
      }

      const nextEvents = events.map(existingEvent => {
        return existingEvent.id == event.id
          ? { ...existingEvent, start, end, allDay }
          : existingEvent
      })

      setEvents(nextEvents)
      // alert(`${event.title} was dropped onto ${updatedEvent.start}`)
    }
    const onMoving = useCallback(
      (nextStart, nextEnd, movingEvent) => {
        const inRange = inEventRange(nextStart, nextEnd, movingEvent, events)

        return inRange !== true
      },
      [events]
    )

    return (
      <div
        className="ys-calendar-meetings"
        onContextMenu={e => e.preventDefault()}
      >
        <DragAndDropCalendar
          toolbar={false}
          events={events}
          resources={[
            {
              id: 'a',
              title: 'Room A',
            },
            {
              id: 'b',
              title: 'Room B',
            },
          ]}
          defaultView={'day'}
          step={15}
          timeslots={4}
          min={new Date(2021, month, today, 8, 45)}
          max={new Date(2021, month, today, 23, 0)}
          scrollToTime={new Date(2021, month, date.getHours(), 0)}
          showAllDay={false}
          formats={{
            timeGutterFormat: 'H',
          }}
          onSelectSlot={onSelectSlot}
          onEventDrop={moveEvent}
          onEventResize={onResizeEvent}
          onDragStart={handleDragStart}
          handleDragStart={handleDragStart}
          onMoving={onMoving}
          onResizing={onResizing}
          handleNotPointInColumn={handleNotPointInColumn}
        />
      </div>
    )
  })
