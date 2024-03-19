import * as core from '@actions/core'
import { CopyItem } from './copy_api'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const scr_path: string = core.getInput('src_path')
    const dst_dir: string = core.getInput('dst_dir')

    CopyItem(scr_path, dst_dir)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
