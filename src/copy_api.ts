/**
 * The entrypoint for the action.
 */
import * as fs from 'fs'
import * as path from 'path'

export function CopyItem(src: string, dst_dir: string): void {
  const src_dir = path.dirname(src)
  const pattern_str = path.basename(src)
  const re_pattern = new RegExp(pattern_str.replace('*', '.*'))
  const files = fs.readdirSync(src_dir)

  for (const file of files) {
    const filePathSrc = path.join(src_dir, file) // construct the full path to the file
    const filePathDst = path.join(dst_dir, file) // construct the full path to the file

    const probe = re_pattern.exec(file)

    try {
      if (probe) {
        if (probe[0] === file) {
          console.log(`File ${file} is target`)
          fs.copyFileSync(filePathSrc, filePathDst)
        } else {
          console.log(`File ${file} is not target step 2`)
        }
      } else {
        console.log(`File ${file} is not target`)
      }
    } catch (error) {
      console.log(error)
    }
  }
}
