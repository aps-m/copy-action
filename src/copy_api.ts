/**
 * The entrypoint for the action.
 */
import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'

export function CopyItem(src: string, dst_dir: string): void {
  const src_dir = path.dirname(src)
  const pattern_str = path.basename(src)
  const re_pattern = new RegExp(pattern_str.replace('*', '.*'))
  const files = fs.readdirSync(src_dir)
  let status = false
  let res_file = ''

  try {
    for (const file of files) {
      const filePathSrc = path.join(src_dir, file) // construct the full path to the file
      const filePathDst = path.join(dst_dir, file) // construct the full path to the file

      const probe = re_pattern.exec(file)

      if (probe) {
        if (probe[0] === file) {
          core.debug(`File ${file} is target`)
          fs.copyFileSync(filePathSrc, filePathDst)
          status = true
          res_file = file
          break
        } else {
          core.debug(`File ${file} is not target (step 2)`)
        }
      } else {
        core.debug(`File ${file} is not target (step 1)`)
      }
    }
  } catch (error) {
    status = false
    console.log(error)
  }

  if (status) {
    console.log(`File ${res_file} was copied succesfully!`)
  } else {
    console.log(`Error of copying file`)
  }
}
