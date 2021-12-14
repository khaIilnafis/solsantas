import React from 'react';
import { Button } from 'antd';
import { LABELS } from '../../constants';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const history = useNavigate();
  return (
    <Button type="text" onClick={() => history(-1)}>
      {LABELS.GO_BACK_ACTION}
    </Button>
  );
};
