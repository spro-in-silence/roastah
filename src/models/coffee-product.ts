import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { Product as MedusaProduct } from "@medusajs/medusa"
import { generateEntityId } from "@medusajs/medusa/dist/utils"
import { Roaster } from "./roaster"

@Entity()
export class CoffeeProduct extends MedusaProduct {
  @Column({ type: "varchar" })
  roaster_id: string

  @Column({ type: "varchar" })
  origin: string

  @Column({ type: "varchar" })
  roast_level: string

  @Column({ type: "varchar" })
  process: string

  @Column({ type: "varchar", nullable: true })
  altitude: string | null

  @Column({ type: "varchar", nullable: true })
  varietal: string | null

  @Column({ type: "text", nullable: true })
  tasting_notes: string | null

  @Column({ type: "varchar", array: true, default: "{}" })
  images: string[]

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @ManyToOne(() => Roaster, (roaster) => roaster.products)
  @JoinColumn({ name: "roaster_id" })
  roaster: Roaster

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "coffee_prod")
  }
}