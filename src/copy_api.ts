/**
 * The entrypoint for the action.
 */
import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'

export function CopyItem(src: string, dst_dir: string): void {
  const src_dir = path.dirname(src)
  const pattern_str = path.basename(src).replace(/\./g, '\\.')
  const re_pattern = new RegExp(pattern_str.replace(/\*/g, '.*'))
  const files = fs.readdirSync(src_dir)
  let status = false
  const res_files: string[] = []

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
          res_files.push(file)
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
    console.log(`Files ${res_files} was copied succesfully!`)
  } else {
    console.log(`Error of copying files (files not found)`)
    core.setFailed(`Error of copying files (files not found)`)
  }
}
