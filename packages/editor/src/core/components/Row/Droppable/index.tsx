import React from 'react';
import { useCellDrop } from '../../Cell/Droppable';
import { useIsInsertMode, useIsLayoutMode } from '../../hooks';

const Droppable: React.FC<{ nodeId: string }> = ({ children, nodeId }) => {
  const isLayoutMode = useIsLayoutMode();
  const isInsertMode = useIsInsertMode();

  const [ref, isAllowed] = useCellDrop(nodeId);
  if (!(isLayoutMode || isInsertMode)) {
    return <div className="react-page-row-droppable-container">{children}</div>;
  }
  return (
    <div ref={ref} className="react-page-row-droppable">
      {children}
    </div>
  );
};

export default Droppable;
