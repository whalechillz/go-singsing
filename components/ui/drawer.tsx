"use client"

import * as React from "react"
import * as DrawerPrimitive from "@radix-ui/react-dialog"

const Drawer = DrawerPrimitive.Root
const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Overlay className="fixed inset-0 bg-black/40 z-50" />
    <DrawerPrimitive.Content
      ref={ref}
      className={
        "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-lg p-4 shadow-lg animate-in slide-in-from-bottom-80 " +
        (className || "")
      }
      {...props}
    >
      {children}
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
))
DrawerContent.displayName = "DrawerContent"

export { Drawer, DrawerTrigger, DrawerContent } 