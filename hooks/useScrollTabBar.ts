import { useCallback, useEffect, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";

export const useScrollTabBar = () => {
  const { setVisible } = useTabBarVisibility();
  const lastOffset = useRef(0);

  useEffect(() => {
    setVisible(true);
  }, [setVisible]);

  return useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const delta = currentOffset - lastOffset.current;

      if (currentOffset <= 0) {
        setVisible(true);
        lastOffset.current = currentOffset;
        return;
      }

      if (delta > 8 && currentOffset > 20) {
        setVisible(false);
      } else if (delta < -8) {
        setVisible(true);
      }

      lastOffset.current = currentOffset;
    },
    [setVisible]
  );
};
