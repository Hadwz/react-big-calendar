import PropTypes from 'prop-types'
import React from 'react'
import clsx from 'clsx'
import { isEqualWith, isEqual } from 'lodash'
import { accessor as get } from '../../utils/accessors'
import { DnDContext } from './DnDContext'

/**
 * EventWrapper的作用：组合包裹Event，Anchor，监听move，resize等操作，并派发给其他组件
 */
class EventWrapper extends React.Component {
  static contextType = DnDContext

  static propTypes = {
    type: PropTypes.oneOf(['date', 'time']),
    event: PropTypes.object.isRequired,

    draggable: PropTypes.bool,
    allDay: PropTypes.bool,
    isRow: PropTypes.bool,
    continuesPrior: PropTypes.bool,
    continuesAfter: PropTypes.bool,
    isDragging: PropTypes.bool,
    isResizing: PropTypes.bool,
    resizable: PropTypes.bool,
    isPreview: PropTypes.bool,
  }

  handleResizeUp = e => {
    //修改点：e.button等于0代表的是鼠标左键点击
    //当e为TouchEvent时，e.button就不等于0，这里加上type的判断来兼容
    if (e.type === 'mousedown' && e.button !== 0) return
    this.context.draggable.onBeginAction(this.props.event, 'resize', 'UP')
  }
  handleResizeDown = e => {
    if (e.type === 'mousedown' && e.button !== 0) return
    this.context.draggable.onBeginAction(this.props.event, 'resize', 'DOWN')
  }
  handleResizeLeft = e => {
    if (e.type === 'mousedown' && e.button !== 0) return
    this.context.draggable.onBeginAction(this.props.event, 'resize', 'LEFT')
  }
  handleResizeRight = e => {
    if (e.type === 'mousedown' && e.button !== 0) return
    this.context.draggable.onBeginAction(this.props.event, 'resize', 'RIGHT')
  }
  handleStartDragging = e => {
    if (e.type === 'mousedown' && e.button !== 0) return
    // hack: because of the way the anchors are arranged in the DOM, resize
    // anchor events will bubble up to the move anchor listener. Don't start
    // move operations when we're on a resize anchor.
    const isResizeHandle = e.target.className.includes('rbc-addons-dnd-resize')
    if (!isResizeHandle)
      this.context.draggable.onBeginAction(this.props.event, 'move')
  }

  isEqualEvent(ev1, ev2) {
    return (
      ev1.id === ev2.id ||
      ev1.title === ev2.title ||
      (isEqual(ev1.start, ev2.start) && isEqual(ev1.end, ev2.end))
    )
  }

  renderAnchor(direction) {
    const cls = direction === 'Up' || direction === 'Down' ? 'ns' : 'ew'
    return (
      <div
        className={`rbc-addons-dnd-resize-${cls}-anchor`}
        onMouseDown={this[`handleResize${direction}`]}
        //修改点：监听触摸开始事件
        onTouchMove={this[`handleResize${direction}`]}
      >
        <div className={`rbc-addons-dnd-resize-${cls}-icon`} />
      </div>
    )
  }

  /**
   * 渲染预览的Event
   * 修改点：如果事件支持调整大小，则在事件的基础上，增加resizeAnchor的内容
   * @param {boolean} isResizable 是否可以调整大小
   */
  renderPreviewEvent(isResizable) {
    const { type, children, continuesPrior, continuesAfter } = this.props

    if (isResizable) {
      let StartAnchor = null
      let EndAnchor = null

      // replace original event child with anchor-embellished child
      if (type === 'date') {
        StartAnchor = !continuesPrior && this.renderAnchor('Left')
        EndAnchor = !continuesAfter && this.renderAnchor('Right')
      } else {
        StartAnchor = !continuesPrior && this.renderAnchor('Up')
        EndAnchor = !continuesAfter && this.renderAnchor('Down')
      }

      return React.cloneElement(children, {
        children: (
          <div className="rbc-addons-dnd-resizable">
            {StartAnchor}
            {children.props.children}
            {EndAnchor}
          </div>
        ),
        className: clsx(children.props.className),
      })
    }

    return React.cloneElement(children, {
      className: clsx(children.props.className),
    })
  }

  render() {
    const {
      event,
      type,
      continuesPrior,
      continuesAfter,
      resizable,
      isPreview,
    } = this.props

    let { children } = this.props

    const { draggable } = this.context
    const { draggableAccessor, resizableAccessor } = draggable

    const isDraggable = draggableAccessor
      ? !!get(event, draggableAccessor)
      : true

    /* Event is not draggable, no need to wrap it */
    if (!isDraggable) {
      return children
    }

    /*
     * The resizability of events depends on whether they are
     * allDay events and how they are displayed.
     *
     * 1. If the event is being shown in an event row (because
     * it is an allDay event shown in the header row or because as
     * in month view the view is showing all events as rows) then we
     * allow east-west resizing.
     *
     * 2. Otherwise the event is being displayed
     * normally, we can drag it north-south to resize the times.
     *
     * See `DropWrappers` for handling of the drop of such events.
     *
     * Notwithstanding the above, we never show drag anchors for
     * events which continue beyond current component. This happens
     * in the middle of events when showMultiDay is true, and to
     * events at the edges of the calendar's min/max location.
     */
    const isResizable =
      resizable && (resizableAccessor ? !!get(event, resizableAccessor) : true)

    if (isResizable || isDraggable) {
      if (isPreview) {
        return this.renderPreviewEvent(isResizable)
      }

      /*
       * props.children is the singular <Event> component.
       * BigCalendar positions the Event abolutely and we
       * need the anchors to be part of that positioning.
       * So we insert the anchors inside the Event's children
       * rather than wrap the Event here as the latter approach
       * would lose the positioning.
       */
      const newProps = {
        onMouseDown: this.handleStartDragging,
        onTouchStart: this.handleStartDragging,
      }

      if (isResizable) {
        // replace original event child with anchor-embellished child
        let StartAnchor = null
        let EndAnchor = null

        if (type === 'date') {
          StartAnchor = !continuesPrior && this.renderAnchor('Left')
          EndAnchor = !continuesAfter && this.renderAnchor('Right')
        } else {
          StartAnchor = !continuesPrior && this.renderAnchor('Up')
          EndAnchor = !continuesAfter && this.renderAnchor('Down')
        }

        newProps.children = (
          <div className="rbc-addons-dnd-resizable">
            {StartAnchor}
            {children.props.children}
            {EndAnchor}
          </div>
        )
      }

      if (
        draggable.dragAndDropAction.interacting && // if an event is being dragged right now
        //修改点：这里只做值相等判断，不做引用判断
        //修改目的：修复resize的时候event没有正确加上class，导致event出现半透明而没有隐藏显示的问题
        isEqualWith(draggable.dragAndDropAction.event, event, this.isEqualEvent)
      ) {
        // add a new class to it
        newProps.className = clsx(
          children.props.className,
          'rbc-addons-dnd-dragged-event',
          'rbc-addons-dnd-dragged-active'
        )
      }

      children = React.cloneElement(children, newProps)
    }

    return children
  }
}

export default EventWrapper
