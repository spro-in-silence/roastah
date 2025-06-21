import { TransactionBaseService } from "@medusajs/medusa"
import { Roaster } from "../models/roaster"
import { MedusaError } from "medusa-core-utils"

class RoasterService extends TransactionBaseService {
  constructor(container) {
    super(container)
    this.roasterRepository_ = container.roasterRepository
  }

  async create(roasterData) {
    return this.atomicPhase_(async (manager) => {
      const roasterRepo = manager.withRepository(this.roasterRepository_)
      
      const roaster = roasterRepo.create(roasterData)
      const result = await roasterRepo.save(roaster)
      
      return result
    })
  }

  async retrieve(roasterId, config = {}) {
    const roasterRepo = this.activeManager_.withRepository(this.roasterRepository_)
    
    const roaster = await roasterRepo.findOne({
      where: { id: roasterId },
      ...config
    })

    if (!roaster) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Roaster with id: ${roasterId} was not found`
      )
    }

    return roaster
  }

  async retrieveByUserId(userId) {
    const roasterRepo = this.activeManager_.withRepository(this.roasterRepository_)
    
    return await roasterRepo.findOne({
      where: { user_id: userId }
    })
  }

  async update(roasterId, update) {
    return this.atomicPhase_(async (manager) => {
      const roasterRepo = manager.withRepository(this.roasterRepository_)
      
      const roaster = await this.retrieve(roasterId)
      
      for (const [key, value] of Object.entries(update)) {
        roaster[key] = value
      }
      
      return await roasterRepo.save(roaster)
    })
  }

  async approveRoaster(roasterId) {
    return this.update(roasterId, { is_approved: true })
  }

  async list(selector = {}, config = {}) {
    const roasterRepo = this.activeManager_.withRepository(this.roasterRepository_)
    
    return await roasterRepo.findAndCount({
      where: selector,
      ...config
    })
  }
}

export default RoasterService