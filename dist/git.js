import { execSync } from 'node:child_process';
function run(cmd, cwd) {
    try {
        return execSync(cmd, { cwd, encoding: 'utf8', timeout: 2000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    }
    catch {
        return '';
    }
}
export function getGitStatus(cwd) {
    const branch = run('git rev-parse --abbrev-ref HEAD', cwd);
    if (!branch)
        return null;
    const porcelain = run('git status --porcelain', cwd);
    const lines = porcelain ? porcelain.split('\n').filter(Boolean) : [];
    let modified = 0, added = 0, deleted = 0, untracked = 0;
    for (const line of lines) {
        const code = line.slice(0, 2);
        if (code.includes('?'))
            untracked++;
        else if (code.includes('A'))
            added++;
        else if (code.includes('D'))
            deleted++;
        else
            modified++;
    }
    let ahead = 0, behind = 0;
    const tracking = run('git rev-parse --abbrev-ref @{upstream}', cwd);
    if (tracking) {
        const aheadStr = run(`git rev-list --count ${tracking}..HEAD`, cwd);
        const behindStr = run(`git rev-list --count HEAD..${tracking}`, cwd);
        ahead = parseInt(aheadStr) || 0;
        behind = parseInt(behindStr) || 0;
    }
    return {
        branch,
        isDirty: lines.length > 0,
        ahead, behind,
        modified, added, deleted, untracked,
    };
}
