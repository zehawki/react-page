import React from 'react';
import { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { CellDrag } from '../../types/node';

import {
  useCellIsAllowedHere,
  useInsertNew,
  useSetDisplayReferenceNodeId,
} from '../hooks';

const FallbackDropArea: React.FC = ({ children }) => {
  const insertNew = useInsertNew();

  const isAllowed = useCellIsAllowedHere();
  const [, dropRef] = useDrop<CellDrag, void, void>({
    accept: 'cell',
    canDrop: (item) => isAllowed(item),
    drop: (item, monitor) => {
      // fallback drop
      if (!monitor.didDrop()) {
        insertNew(item.cell);
      }
    },
  });

  const setReference = useSetDisplayReferenceNodeId();
  const clearReference = useCallback(() => setReference(null), [setReference]);

  return (
    <div ref={dropRef} onClick={clearReference}>
      {children}
    </div>
  );
};

export default FallbackDropArea;
