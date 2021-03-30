'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _inheritsLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)

var _propTypes = _interopRequireDefault(require('prop-types'))

var _react = _interopRequireDefault(require('react'))

var _clsx = _interopRequireDefault(require('clsx'))

var _lodash = require('lodash')

var _accessors = require('../../utils/accessors')

var _DnDContext = require('./DnDContext')

/**
 * EventWrapper的作用：组合包裹Event，Anchor，监听move，resize等操作，并派发给其他组件
 */
var EventWrapper =
  /*#__PURE__*/
  (function(_React$Component) {
    ;(0, _inheritsLoose2.default)(EventWrapper, _React$Component)

    function EventWrapper() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this =
        _React$Component.call.apply(_React$Component, [this].concat(args)) ||
        this

      _this.handleResizeUp = function(e) {
        //修改点：e.button等于0代表的是鼠标左键点击
        //当e为TouchEvent时，e.button就不等于0，这里加上type的判断来兼容
        if (e.type === 'mousedown' && e.button !== 0) return

        _this.context.draggable.onBeginAction(_this.props.event, 'resize', 'UP')
      }

      _this.handleResizeDown = function(e) {
        if (e.type === 'mousedown' && e.button !== 0) return

        _this.context.draggable.onBeginAction(
          _this.props.event,
          'resize',
          'DOWN'
        )
      }

      _this.handleResizeLeft = function(e) {
        if (e.type === 'mousedown' && e.button !== 0) return

        _this.context.draggable.onBeginAction(
          _this.props.event,
          'resize',
          'LEFT'
        )
      }

      _this.handleResizeRight = function(e) {
        if (e.type === 'mousedown' && e.button !== 0) return

        _this.context.draggable.onBeginAction(
          _this.props.event,
          'resize',
          'RIGHT'
        )
      }

      _this.handleStartDragging = function(e) {
        if (e.type === 'mousedown' && e.button !== 0) return // hack: because of the way the anchors are arranged in the DOM, resize
        // anchor events will bubble up to the move anchor listener. Don't start
        // move operations when we're on a resize anchor.

        var isResizeHandle = e.target.className.includes(
          'rbc-addons-dnd-resize'
        )
        if (!isResizeHandle)
          _this.context.draggable.onBeginAction(_this.props.event, 'move')
      }

      return _this
    }

    var _proto = EventWrapper.prototype

    _proto.isEqualEvent = function isEqualEvent(ev1, ev2) {
      return (
        ev1.id === ev2.id ||
        ev1.title === ev2.title ||
        ((0, _lodash.isEqual)(ev1.start, ev2.start) &&
          (0, _lodash.isEqual)(ev1.end, ev2.end))
      )
    }

    _proto.renderAnchor = function renderAnchor(direction) {
      var cls = direction === 'Up' || direction === 'Down' ? 'ns' : 'ew'
      return _react.default.createElement(
        'div',
        {
          className: 'rbc-addons-dnd-resize-' + cls + '-anchor',
          onMouseDown: this['handleResize' + direction], //修改点：监听触摸开始事件
          onTouchMove: this['handleResize' + direction],
        },
        _react.default.createElement('div', {
          className: 'rbc-addons-dnd-resize-' + cls + '-icon',
        })
      )
    }
    /**
     * 渲染预览的Event
     * 修改点：如果事件支持调整大小，则在事件的基础上，增加resizeAnchor的内容
     * @param {boolean} isResizable 是否可以调整大小
     */

    _proto.renderPreviewEvent = function renderPreviewEvent(isResizable) {
      var _this$props = this.props,
        type = _this$props.type,
        children = _this$props.children,
        continuesPrior = _this$props.continuesPrior,
        continuesAfter = _this$props.continuesAfter

      if (isResizable) {
        var StartAnchor = null
        var EndAnchor = null // replace original event child with anchor-embellished child

        if (type === 'date') {
          StartAnchor = !continuesPrior && this.renderAnchor('Left')
          EndAnchor = !continuesAfter && this.renderAnchor('Right')
        } else {
          StartAnchor = !continuesPrior && this.renderAnchor('Up')
          EndAnchor = !continuesAfter && this.renderAnchor('Down')
        }

        return _react.default.cloneElement(children, {
          children: _react.default.createElement(
            'div',
            {
              className: 'rbc-addons-dnd-resizable',
            },
            StartAnchor,
            children.props.children,
            EndAnchor
          ),
          className: (0, _clsx.default)(children.props.className),
        })
      }

      return _react.default.cloneElement(children, {
        className: (0, _clsx.default)(children.props.className),
      })
    }

    _proto.render = function render() {
      var _this$props2 = this.props,
        event = _this$props2.event,
        type = _this$props2.type,
        continuesPrior = _this$props2.continuesPrior,
        continuesAfter = _this$props2.continuesAfter,
        resizable = _this$props2.resizable,
        isPreview = _this$props2.isPreview
      var children = this.props.children
      var draggable = this.context.draggable
      var draggableAccessor = draggable.draggableAccessor,
        resizableAccessor = draggable.resizableAccessor
      var isDraggable = draggableAccessor
        ? !!(0, _accessors.accessor)(event, draggableAccessor)
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

      var isResizable =
        resizable &&
        (resizableAccessor
          ? !!(0, _accessors.accessor)(event, resizableAccessor)
          : true)

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

        var newProps = {
          onMouseDown: this.handleStartDragging,
          onTouchStart: this.handleStartDragging,
        }

        if (isResizable) {
          // replace original event child with anchor-embellished child
          var StartAnchor = null
          var EndAnchor = null

          if (type === 'date') {
            StartAnchor = !continuesPrior && this.renderAnchor('Left')
            EndAnchor = !continuesAfter && this.renderAnchor('Right')
          } else {
            StartAnchor = !continuesPrior && this.renderAnchor('Up')
            EndAnchor = !continuesAfter && this.renderAnchor('Down')
          }

          newProps.children = _react.default.createElement(
            'div',
            {
              className: 'rbc-addons-dnd-resizable',
            },
            StartAnchor,
            children.props.children,
            EndAnchor
          )
        }

        if (
          draggable.dragAndDropAction.interacting && // if an event is being dragged right now
          //修改点：这里只做值相等判断，不做引用判断
          //修改目的：修复resize的时候event没有正确加上class，导致event出现半透明而没有隐藏显示的问题
          (0, _lodash.isEqualWith)(
            draggable.dragAndDropAction.event,
            event,
            this.isEqualEvent
          )
        ) {
          // add a new class to it
          newProps.className = (0, _clsx.default)(
            children.props.className,
            'rbc-addons-dnd-dragged-event',
            'rbc-addons-dnd-dragged-active'
          )
        }

        children = _react.default.cloneElement(children, newProps)
      }

      return children
    }

    return EventWrapper
  })(_react.default.Component)

EventWrapper.contextType = _DnDContext.DnDContext
EventWrapper.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        type: _propTypes.default.oneOf(['date', 'time']),
        event: _propTypes.default.object.isRequired,
        draggable: _propTypes.default.bool,
        allDay: _propTypes.default.bool,
        isRow: _propTypes.default.bool,
        continuesPrior: _propTypes.default.bool,
        continuesAfter: _propTypes.default.bool,
        isDragging: _propTypes.default.bool,
        isResizing: _propTypes.default.bool,
        resizable: _propTypes.default.bool,
        isPreview: _propTypes.default.bool,
      }
    : {}
var _default = EventWrapper
exports.default = _default
module.exports = exports['default']
