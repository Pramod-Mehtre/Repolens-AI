import os
import zipfile
import re

def create_deploy_zip():
    zip_filename = 'repolens-deploy-final.zip'
    
    # Remove existing zip if it exists
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
        
    print(f"Creating {zip_filename} with POSIX-compliant paths...")
    
    # Patterns to exclude
    exclude_dirs = {'.git', 'node_modules', '.idea', '.vscode'}
    exclude_files = {'repolens-deploy-final.zip', 'repolens-deploy.zip', 'create_zip.py', '.DS_Store'}
    exclude_prefixes = {'.env'}
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Skip excluded files by exact name or prefix
                if file in exclude_files or any(file.startswith(prefix) for prefix in exclude_prefixes):
                    continue
                    
                # Get absolute and relative paths
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, '.')
                
                # Force forward slashes for POSIX compatibility (Crucial for AWS EB)
                posix_path = rel_path.replace(os.sep, '/')
                
                # Write to zip
                zipf.write(file_path, posix_path)
                print(f"Added: {posix_path}")

if __name__ == "__main__":
    create_deploy_zip()
    print("Done! ZIP file is ready for AWS Elastic Beanstalk.")
