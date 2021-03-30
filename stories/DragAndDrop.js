import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import { events, Views, DragAndDropCalendar } from './helpers'
import customComponents from './helpers/customComponents'

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
  .add('test mobile draggable', () => {
    const propsEvents = [
      {
        id: 1,
        title: 'A',
        resourceId: 'a',
        start: new Date(2021, 2, 30, 9, 0),
        end: new Date(2021, 2, 30, 10, 0),
      },
      {
        id: 2,
        title: 'B',
        resourceId: 'a',
        start: new Date(2021, 2, 30, 13, 0),
        end: new Date(2021, 2, 30, 14, 0),
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

    const dragFromOutsideItem = () => {
      return draggedEvent
    }

    const onDropFromOutside = ({ start, end, allDay }) => {
      const { draggedEvent } = this.state

      const event = {
        id: draggedEvent.id,
        title: draggedEvent.title,
        start,
        end,
        allDay: allDay,
      }

      setDraggedEvent(null)
      moveEvent({ event, start, end })
    }

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
          min={new Date(2021, 2, 30, 8, 45)}
          max={new Date(2021, 2, 30, 23, 0)}
          onSelectSlot={onSelectSlot}
          onEventDrop={moveEvent}
          onEventResize={onResizeEvent}
          onDragStart={handleDragStart}
          handleDragStart={handleDragStart}
          onDropFromOutside={onDropFromOutside}
          dragFromOutsideItem={dragFromOutsideItem}
          formats={{
            timeGutterFormat: 'H',
          }}
          showAllDay={false}
        />
      </div>
    )
  })
