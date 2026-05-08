"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useMemo, useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

type SideCustomization = {
  label: string
  overlayType?: string
  overlayName?: string
  overlayImageUrl?: string
  overlaySourceLabel?: string
  overlayScale?: number
  overlayOffsetX?: number
  overlayOffsetY?: number
  mascotName?: string
  mascotImageUrl?: string
  mascotScale?: number
  mascotOffsetX?: number
  mascotOffsetY?: number
  overlayText?: string
  overlayTextScale?: number
  overlayTextOffsetX?: number
  overlayTextOffsetY?: number
  overlayTextColor?: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const sideCustomizations = useMemo<SideCustomization[]>(() => {
    const front: SideCustomization = {
      label: "Front",
      overlayType: item.metadata?.front_overlay_type as string | undefined,
      overlayName:
        (item.metadata?.front_overlay_name as string | undefined) ||
        (item.metadata?.front_mascot_name as string | undefined),
      overlayImageUrl:
        (item.metadata?.front_overlay_image_url as string | undefined) ||
        (item.metadata?.front_mascot_image_url as string | undefined),
      overlaySourceLabel: item.metadata?.front_overlay_source_label as
        | string
        | undefined,
      overlayScale:
        (item.metadata?.front_overlay_scale as number | undefined) ??
        (item.metadata?.front_mascot_scale as number | undefined),
      overlayOffsetX:
        (item.metadata?.front_overlay_offset_x as number | undefined) ??
        (item.metadata?.front_mascot_offset_x as number | undefined),
      overlayOffsetY:
        (item.metadata?.front_overlay_offset_y as number | undefined) ??
        (item.metadata?.front_mascot_offset_y as number | undefined),
      mascotName: item.metadata?.front_mascot_name as string | undefined,
      mascotImageUrl: item.metadata?.front_mascot_image_url as string | undefined,
      mascotScale: item.metadata?.front_mascot_scale as number | undefined,
      mascotOffsetX: item.metadata?.front_mascot_offset_x as number | undefined,
      mascotOffsetY: item.metadata?.front_mascot_offset_y as number | undefined,
      overlayText: item.metadata?.front_overlay_text as string | undefined,
      overlayTextScale: item.metadata?.front_overlay_text_scale as
        | number
        | undefined,
      overlayTextOffsetX: item.metadata?.front_overlay_text_offset_x as
        | number
        | undefined,
      overlayTextOffsetY: item.metadata?.front_overlay_text_offset_y as
        | number
        | undefined,
      overlayTextColor: item.metadata?.front_overlay_text_color as
        | string
        | undefined,
    }

    const back: SideCustomization = {
      label: "Back",
      overlayType: item.metadata?.back_overlay_type as string | undefined,
      overlayName:
        (item.metadata?.back_overlay_name as string | undefined) ||
        (item.metadata?.back_mascot_name as string | undefined),
      overlayImageUrl:
        (item.metadata?.back_overlay_image_url as string | undefined) ||
        (item.metadata?.back_mascot_image_url as string | undefined),
      overlaySourceLabel: item.metadata?.back_overlay_source_label as
        | string
        | undefined,
      overlayScale:
        (item.metadata?.back_overlay_scale as number | undefined) ??
        (item.metadata?.back_mascot_scale as number | undefined),
      overlayOffsetX:
        (item.metadata?.back_overlay_offset_x as number | undefined) ??
        (item.metadata?.back_mascot_offset_x as number | undefined),
      overlayOffsetY:
        (item.metadata?.back_overlay_offset_y as number | undefined) ??
        (item.metadata?.back_mascot_offset_y as number | undefined),
      mascotName: item.metadata?.back_mascot_name as string | undefined,
      mascotImageUrl: item.metadata?.back_mascot_image_url as string | undefined,
      mascotScale: item.metadata?.back_mascot_scale as number | undefined,
      mascotOffsetX: item.metadata?.back_mascot_offset_x as number | undefined,
      mascotOffsetY: item.metadata?.back_mascot_offset_y as number | undefined,
      overlayText: item.metadata?.back_overlay_text as string | undefined,
      overlayTextScale: item.metadata?.back_overlay_text_scale as
        | number
        | undefined,
      overlayTextOffsetX: item.metadata?.back_overlay_text_offset_x as
        | number
        | undefined,
      overlayTextOffsetY: item.metadata?.back_overlay_text_offset_y as
        | number
        | undefined,
      overlayTextColor: item.metadata?.back_overlay_text_color as
        | string
        | undefined,
    }

    return [front, back].filter(
      (side) => side.overlayName || side.mascotName || side.overlayText
    )
  }, [item.metadata])

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>

        <LineItemOptions variant={item.variant} data-testid="product-variant" />

        {sideCustomizations.map((side) => (
          <div
            key={side.label}
            className="mt-3 rounded border border-ui-border-base p-3"
          >
            <Text className="txt-small-plus text-ui-fg-base">
              {side.label} Customization
            </Text>

            {side.overlayName ? (
              <div className="mt-2 flex items-start gap-3">
                {side.overlayImageUrl ? (
                  <img
                    src={side.overlayImageUrl}
                    alt={side.overlayName}
                    className="h-16 w-16 rounded border object-contain bg-white"
                  />
                ) : null}

                <div className="flex flex-col gap-1">
                  <Text className="txt-small text-ui-fg-subtle">
                    {side.overlayType === "design" ? "Design Overlay" : "Mascot"}:{" "}
                    {side.overlayName}
                  </Text>

                  {side.overlaySourceLabel ? (
                    <Text className="txt-small text-ui-fg-subtle">
                      Source: {side.overlaySourceLabel}
                    </Text>
                  ) : null}

                  {typeof side.overlayScale !== "undefined" ? (
                    <Text className="txt-small text-ui-fg-subtle">
                      Overlay Scale: {side.overlayScale}
                    </Text>
                  ) : null}

                  {(typeof side.overlayOffsetX !== "undefined" ||
                    typeof side.overlayOffsetY !== "undefined") ? (
                    <Text className="txt-small text-ui-fg-subtle">
                      Overlay Offset: X {side.overlayOffsetX ?? 0}, Y{" "}
                      {side.overlayOffsetY ?? 0}
                    </Text>
                  ) : null}
                </div>
              </div>
            ) : null}

            {side.overlayText ? (
              <div className="mt-2 flex flex-col gap-1">
                <Text className="txt-small text-ui-fg-subtle">
                  Text: {side.overlayText}
                </Text>

                {typeof side.overlayTextScale !== "undefined" ? (
                  <Text className="txt-small text-ui-fg-subtle">
                    Text Size: {side.overlayTextScale}
                  </Text>
                ) : null}

                {(typeof side.overlayTextOffsetX !== "undefined" ||
                  typeof side.overlayTextOffsetY !== "undefined") ? (
                  <Text className="txt-small text-ui-fg-subtle">
                    Text Offset: X {side.overlayTextOffsetX ?? 0}, Y{" "}
                    {side.overlayTextOffsetY ?? 0}
                  </Text>
                ) : null}

                {side.overlayTextColor ? (
                  <div className="flex items-center gap-2">
                    <Text className="txt-small text-ui-fg-subtle">
                      Text Color: {side.overlayTextColor}
                    </Text>
                    <span
                      className="inline-block h-4 w-4 rounded border border-ui-border-base"
                      style={{ backgroundColor: side.overlayTextColor }}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
