import React from 'react';
import { Component, PropTypes, ReactDOM } from '../utils/';
import Transition from '../transition';
import Icon from '../icon';

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      children: props.children,
      activeKey: props.activeKey,
      slideStyle: {
        width: 0,
        left: 0,
      },
    };
  }
  componentDidMount() {
    this.updateFirstMount();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.position !== this.props.position) {
      setTimeout(() => {
        this.calcSlideStyle();
      });
    }
  }
  updateFirstMount() {
    setTimeout(() => {
      this.calcSlideStyle();
    });
  }
  calcSlideStyle() {
    if (!this.tabsBar.length) return;
    const { activeKey } = this.state;
    const children = this.state.children instanceof Array ? this.state.children : [this.state.children];
    const style = {};
    let left = 0;
    children.every((item, idx) => {
      const elm = this.tabsBar[idx];
      if (item.key === activeKey) {
        style.width = elm.clientWidth;
        return false;
      }
      left += elm.clientWidth;
      return true;
    });
    style.left = left;
    this.setState({ slideStyle: style });
  }
  onTabREmove(item, idx, e) {
    const { children, activeKey } = this.state;
    const { onTabRemove } = this.props;
    const state = {};
    state.children = [...children];
    e.stopPropagation();
    state.children.splice(idx, 1);

    if (item.key === activeKey && state.children.length > 0) {
      state.activeKey = state.children[0].key;
    }
    this.setState({ ...state }, () => {
      onTabRemove(item, idx, e);
    });
  }
  onTabClick(item, key, e) {
    const { onTabClick } = this.props;
    if (item.props.disabled) return;
    this.setState({
      activeKey: key,
    }, () => {
      this.calcSlideStyle(key);
      onTabClick(item, key, e);
    });
  }
  render() {
    const { prefixCls, className, position, type, sequence, onTabClick, closable, onTabRemove, ...other } = this.props;
    const { activeKey, children, slideStyle } = this.state;
    const cls = this.classNames(prefixCls, className, {
      [`${prefixCls}-${position}`]: position,
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-vertical`]: position === 'left' || position === 'right',
    });
    // 寄存Dom节点实体
    this.tabsBar = [];
    delete other.activeKey;
    const Line = (type === 'line' && (position === 'top' || position === 'bottom')) && <div style={slideStyle} className={this.classNames(`${prefixCls}-slide`)} />;

    return (
      <div className={cls} {...other}>
        <div className={`${prefixCls}-bar`}>
          <div className={`${prefixCls}-nav`}>
            {
              React.Children.map(children, (item, idx) => {
                const { label, disabled } = item.props;
                return (
                  <Transition
                    ref={(elm) => {
                      const elmNode = ReactDOM.findDOMNode(elm);
                      if (elmNode) {
                        this.tabsBar.push(elmNode);
                      }
                    }}
                    in
                    unmountOnExit={false}
                  >
                    <div
                      className={this.classNames(`${prefixCls}-tab`, {
                        'w-disabled': disabled,
                        'w-active': item.key === activeKey,
                        'w-closable': closable,
                      })}
                      onClick={this.onTabClick.bind(this, item, item.key)}
                    >
                      {label}
                      {item.props.closable !== false && closable && <Icon type="close" onClick={this.onTabREmove.bind(this, item, idx)} />}
                    </div>
                  </Transition>
                );
              })
            }
            {Line}
          </div>
        </div>
        <div className={`${prefixCls}-content`}>
          {
            React.Children.map(children, (item) => {
              const { key, props } = item;
              return (
                <Transition
                  in={key === activeKey}
                  sequence={props.sequence ? props.sequence : sequence}
                  mountOnEnter={false}
                  unmountOnExit={false}
                  ref={(elm) => {
                    const elmNode = ReactDOM.findDOMNode(elm);
                    if (elmNode && key === activeKey) {
                      elmNode.parentNode.style.height = `${elmNode.clientHeight}px`;
                    }
                  }}
                >
                  <div className={this.classNames(`${prefixCls}-pane`, { 'w-disabled': props.disabled })}>
                    {props.children}
                  </div>
                </Transition>
              );
            })
          }
        </div>
      </div>
    );
  }
}

Tabs.propTypes = {
  prefixCls: PropTypes.string,
  sequence: PropTypes.string,
  type: PropTypes.oneOf(['line', 'card']),
  activeKey: PropTypes.string, // 当前激活 tab 面板的 key
  onTabClick: PropTypes.func, // tab 被点击的回调
  onTabRemove: PropTypes.func, // tab 被点击的回调
  disabled: PropTypes.bool,
  closable: PropTypes.bool,
  position: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
};

Tabs.defaultProps = {
  prefixCls: 'w-tabs',
  sequence: 'fadeIn',
  type: 'line',
  disabled: false,
  closable: false,
  position: 'top',
  onTabClick() { },
  onTabRemove() { },
};
