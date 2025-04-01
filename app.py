import os
import sys
import msvcrt  # For Windows-specific key handling

def get_file_list(directory):
    """
    Gets a list of files in the directory, excluding app.py, node_modules, and .git.

    Args:
        directory: The directory to scan.

    Returns:
        A list of file paths relative to the starting directory.
    """
    file_list = []
    for root, dirs, files in os.walk(directory):
        # Exclude specific directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]

        for file in files:
            if file != os.path.basename(__file__):  # Exclude app.py itself
                file_path = os.path.relpath(os.path.join(root, file), start=directory)
                file_list.append(file_path)
    return file_list

def display_file_list(file_list, selected_index, included_files):
    """
    Displays the file list with the current selection and included status.

    Args:
        file_list: The list of files.
        selected_index: The index of the currently selected file.
        included_files: A set of files that are marked as included.
    """
    os.system('cls')  # Clear the screen (Windows)
    print("Use arrow keys to move, spacebar to include/exclude, Enter to finish:")
    for i, file_path in enumerate(file_list):
        marker = "*" if file_path in included_files else " "
        cursor = ">" if i == selected_index else " "
        print(f"  {cursor} {file_path} {marker}")

def get_content_with_separator(file_path, content):
    """
    Formats the file content with separators for display.

    Args:
        file_path: The path to the file.
        content: The file content as a string.

    Returns:
        The formatted string with separators and file path.
    """
    separator = "---"
    formatted_content = f"{separator}\n\n`{file_path}`:\n```\n{content}\n```\n"
    return formatted_content

def main():
    """
    Main function to run the interactive file selection and display.
    """
    start_dir = os.path.dirname(os.path.abspath(__file__))
    file_list = get_file_list(start_dir)

    if not file_list:
        print("No files found in the directory (excluding app.py, node_modules, .git).")
        return

    selected_index = 0
    included_files = set()

    while True:
        display_file_list(file_list, selected_index, included_files)

        key = msvcrt.getch()
        if key == b'\r':  # Enter key
            os.system('cls')  # Clear the screen on Windows
            break
        elif key == b' ':  # Spacebar
            file_path = file_list[selected_index]
            if file_path in included_files:
                included_files.remove(file_path)
            else:
                included_files.add(file_path)
        elif key == b'H' and selected_index > 0:  # Up arrow
            selected_index -= 1
        elif key == b'P' and selected_index < len(file_list) - 1:  # Down arrow
            selected_index += 1

    print("Selected Files:")
    for file_path in included_files:
        full_path = os.path.join(start_dir, file_path)
        try:
            with open(full_path, 'r') as f:
                content = f.read()
            print(get_content_with_separator(file_path, content))
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    print("---")  # Final separator

if __name__ == "__main__":
    main()