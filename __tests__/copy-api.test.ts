import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import { CopyItem } from '../src/copy_api'

jest.mock('fs')
jest.mock('@actions/core', () => ({ debug: jest.fn(), setFailed: jest.fn() }))

describe('filename matching', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function copy(pattern: string, files: string[]): string[] {
    jest.mocked(fs.readdirSync).mockReturnValue(files as never)
    CopyItem(path.join('source', pattern), 'destination')
    return jest.mocked(fs.copyFileSync).mock.calls.map(call => String(call[0]))
  }

  it.each([
    ['secret[0-9].txt', 'secret1.txt'],
    ['a+b.txt', 'aaab.txt'],
    ['(secret).txt', 'secret.txt'],
    ['release{2}.txt', 'releasee.txt'],
    ['file[.txt', 'file.txt'],
    ['price$^.txt', 'price.txt']
  ])('treats %s as a literal filename', (literal, other) => {
    expect(copy(literal, [literal, other])).toEqual([
      path.join('source', literal)
    ])
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('preserves wildcard matching with literal brackets', () => {
    expect(
      copy('file_[1]*.txt', ['file_[1].txt', 'file_[1]a.txt', 'file_1a.txt'])
    ).toEqual(
      ['file_[1].txt', 'file_[1]a.txt'].map(f => path.join('source', f))
    )
  })

  it('preserves ordinary wildcards and full filename matching', () => {
    expect(
      copy('file_*.txt', ['file_.txt', 'file_1.txt', 'file_1.txt.bak'])
    ).toEqual(['file_.txt', 'file_1.txt'].map(f => path.join('source', f)))
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      path.join('source', 'file_1.txt'),
      path.join('destination', 'file_1.txt')
    )
  })

  it('reports no matching file', () => {
    expect(copy('file.txt', ['file.txt.bak'])).toEqual([])
    expect(core.setFailed).toHaveBeenCalledWith(
      'Error of copying files (files not found)'
    )
  })

  it('preserves copy failure reporting', () => {
    jest.mocked(fs.copyFileSync).mockImplementationOnce(() => {
      throw new Error('copy failed')
    })
    copy('file.txt', ['file.txt'])
    expect(core.setFailed).toHaveBeenCalled()
  })

  it('preserves wildcard behavior for newlines', () => {
    expect(copy('a*.txt', ['a\n.txt'])).toEqual([])
  })

  // A backslash is a filename character on POSIX and a separator on Windows.
  const posixTests = path.sep === '/' ? describe : describe.skip
  posixTests('POSIX filenames', () => {
    it('escapes literal backslashes and alternation', () => {
      expect(copy('file\\.txt', ['file\\.txt', 'file\\Xtxt'])).toEqual([
        path.join('source', 'file\\.txt')
      ])
      jest.mocked(fs.copyFileSync).mockClear()
      expect(copy('a|secret.txt', ['a|secret.txt', 'secret.txt'])).toEqual([
        path.join('source', 'a|secret.txt')
      ])
    })
  })
})
