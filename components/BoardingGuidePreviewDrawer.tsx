"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import React from "react";

type Props = { tourId: string };

const BoardingGuidePreviewDrawer: React.FC<Props> = ({ tourId }) => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button variant="outline" aria-label="탑승지 안내 미리보기" tabIndex={0}>
        탑승지 안내 미리보기
      </Button>
    </DrawerTrigger>
    <DrawerContent className="w-[90vw] max-w-4xl right-0 fixed">
      <DrawerHeader>
        <DrawerTitle>탑승지 안내</DrawerTitle>
        <DrawerDescription>
          투어 참가자에게 발송될 탑승지 안내입니다.
        </DrawerDescription>
      </DrawerHeader>
      <div className="p-4 h-[80vh] overflow-y-auto">
        <iframe
          src={`/document/${tourId}/boarding-guide`}
          className="w-full h-full border-0 rounded"
          title="탑승지 안내 미리보기"
        />
      </div>
    </DrawerContent>
  </Drawer>
);

export default BoardingGuidePreviewDrawer; 