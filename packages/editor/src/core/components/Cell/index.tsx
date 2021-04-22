import React from 'react';
import classNames from 'classnames';
import {
  useCellHasPlugin,
  useCellProps,
  useIsEditMode,
  useIsFocused,
  useIsLayoutMode,
  useIsPreviewMode,
  useIsResizeMode,
  useLang,
  useNodeHasChildren,
  useScrollToViewEffect,
  useCellSpacing,
  useSetDisplayReferenceNodeId,
  useIsInsertMode,
} from '../hooks';
import ErrorCell from './ErrorCell';
import Inner from './Inner';
import scrollIntoViewWithOffset from './utils/scrollIntoViewWithOffset';
import Handle from './Handle';
import { gridClass } from './utils/gridClass';
import { useCallback } from 'react';

const CellErrorGate = class extends React.Component<
  {
    nodeId: string;
  },
  { error: Error }
> {
  state = {
    error: null,
  };
  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <ErrorCell nodeId={this.props.nodeId} error={this.state.error} />;
    }
    return this.props.children;
  }
};

type Props = {
  nodeId: string;
  measureRef?: React.Ref<HTMLDivElement>;
};
const Cell: React.FC<Props> = ({ nodeId, measureRef }) => {
  const focused = useIsFocused(nodeId);

  const {
    inline,
    hasInlineNeighbour,
    isDraft,
    isDraftI18n,
    size,
  } = useCellProps(
    nodeId,
    ({ inline, hasInlineNeighbour, isDraft, isDraftI18n, size }) => ({
      inline,
      hasInlineNeighbour,
      isDraft,
      isDraftI18n,
      size,
    })
  );

  const lang = useLang();
  const isPreviewMode = useIsPreviewMode();
  const isResizeMode = useIsResizeMode();
  const isEditMode = useIsEditMode();
  const isLayoutMode = useIsLayoutMode();
  const isInsertMode = useIsInsertMode();
  const hasChildren = useNodeHasChildren(nodeId);
  const hasPlugin = useCellHasPlugin(nodeId);
  const { x: cellSpacingX, y: cellSpacingY } = useCellSpacing();
  const needVerticalPadding = !hasChildren || hasPlugin;

  const isDraftInLang = isDraftI18n?.[lang] ?? isDraft;
  const ref = React.useRef<HTMLDivElement>();

  const setReferenceNodeId = useSetDisplayReferenceNodeId();
  const onClick = useCallback(
    (e) => {
      if (hasPlugin && isEditMode) {
        e.stopPropagation();
      }
      if (isInsertMode) {
        e.stopPropagation();
        setReferenceNodeId(nodeId);
      }
    },
    [nodeId, hasPlugin, isInsertMode, isEditMode, setReferenceNodeId]
  );
  useScrollToViewEffect(
    nodeId,
    () => {
      if (ref.current) scrollIntoViewWithOffset(ref.current, 120); // 120 is just a sane default, we might make int configurable in the future
    },
    [ref.current]
  );
  if (isDraftInLang && isPreviewMode) {
    return null;
  }

  return (
    <div
      style={
        cellSpacingY !== 0 || cellSpacingX !== 0
          ? {
              padding: `${needVerticalPadding ? cellSpacingY / 2 : 0}px ${
                cellSpacingX / 2
              }px`,
            }
          : undefined
      }
      className={classNames(gridClass(size), {
        'react-page-cell-has-inline-neighbour': hasInlineNeighbour,
        [`react-page-cell-inline-${inline || ''}`]: inline,
      })}
    >
      <div
        ref={ref}
        className={classNames('react-page-cell', {
          'react-page-cell-has-plugin': hasPlugin,
          'react-page-cell-leaf': !hasChildren,
          'react-page-cell-focused': focused,
          'react-page-cell-is-draft': isDraftInLang,
          'react-page-cell-bring-to-front':
            !isResizeMode && !isLayoutMode && inline, // inline must not be active for resize/layout
        })}
        onClick={onClick}
      >
        <Handle nodeId={nodeId} />
        <div
          ref={measureRef}
          style={{
            height: '100%',
            boxSizing: 'border-box',
          }}
        >
          <CellErrorGate nodeId={nodeId}>
            <Inner nodeId={nodeId} />
          </CellErrorGate>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Cell);
