import { BeforeInsert, Column, Entity, Index, OneToMany } from "typeorm"
import { BaseEntity } from "@medusajs/medusa"
import { generateEntityId } from "@medusajs/medusa/dist/utils"
import { CoffeeProduct } from "./coffee-product"

@Entity()
export class Roaster extends BaseEntity {
  @Column({ type: "varchar" })
  user_id: string

  @Column({ type: "varchar" })
  business_name: string

  @Column({ type: "varchar" })
  contact_email: string

  @Column({ type: "varchar", nullable: true })
  contact_phone: string | null

  @Column({ type: "text", nullable: true })
  business_address: string | null

  @Column({ type: "varchar", nullable: true })
  city: string | null

  @Column({ type: "varchar", nullable: true })
  state: string | null

  @Column({ type: "varchar", nullable: true })
  zip_code: string | null

  @Column({ type: "text", nullable: true })
  business_description: string | null

  @Column({ type: "varchar", nullable: true })
  website: string | null

  @Column({ type: "varchar", nullable: true })
  instagram: string | null

  @Column({ type: "int", default: 0 })
  years_experience: number

  @Column({ type: "varchar", array: true, default: "{}" })
  certifications: string[]

  @Column({ type: "varchar", array: true, default: "{}" })
  specialties: string[]

  @Column({ type: "boolean", default: false })
  is_approved: boolean

  @OneToMany(() => CoffeeProduct, (product) => product.roaster)
  products: CoffeeProduct[]

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "roaster")
  }
}