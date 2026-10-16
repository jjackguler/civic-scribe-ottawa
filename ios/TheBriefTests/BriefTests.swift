import XCTest
@testable import TheBrief

final class BriefTests: XCTestCase {
    func testUnsafeLinksAreRejected() {
        for value in ["javascript:alert(1)", "http://example.com", "//example.com", "https://user:password@example.com"] {
            XCTAssertNil(Brief.secureURL(value))
        }
        XCTAssertEqual(Brief.secureURL("/brief/test.mp4")?.absoluteString, "https://app.aibroadsheet.com/brief/test.mp4")
    }
    @MainActor func testOfflineBookmarksSurviveRestartAndRemoval() throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: directory) }
        let item = Brief(id: "test", title: "Test", summary: "Summary", context: "Context", caveat: "Caveat", topic: "AI", format: "brief", date: nil, image: nil, video: nil, path: "/app?story=test", sources: [], aiLabel: "AI-assisted text", transcript: nil, credits: nil)
        let first = BriefStore(directory: directory)
        first.toggle(item)
        XCTAssertTrue(BriefStore(directory: directory).isSaved(item))
        first.toggle(item)
        XCTAssertTrue(BriefStore(directory: directory).saved.isEmpty)
    }
}
