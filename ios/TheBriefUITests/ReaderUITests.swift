import XCTest

final class ReaderUITests: XCTestCase {
    @MainActor func testFeedSourcesSaveAndTabs() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.staticTexts["Updated just now"].waitForExistence(timeout: 40), "Public feed must load successfully")
        let cover = XCTAttachment(screenshot: app.screenshot())
        cover.name = "The Brief — live feed"
        cover.lifetime = .keepAlways
        add(cover)
        let story = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "Read the evidence")).firstMatch
        XCTAssertTrue(story.waitForExistence(timeout: 10))
        story.tap()
        let save = app.buttons["Save story for offline reading"]
        XCTAssertTrue(save.waitForExistence(timeout: 10))
        save.tap()
        XCTAssertTrue(app.buttons["Remove saved story"].exists)
        let detail = XCTAttachment(screenshot: app.screenshot())
        detail.name = "The Brief — evidence reader"
        detail.lifetime = .keepAlways
        add(detail)
        app.tabBars.buttons["Saved"].tap()
        XCTAssertTrue(app.navigationBars["Saved"].waitForExistence(timeout: 5))
        app.terminate()
        app.launch()
        app.tabBars.buttons["Saved"].tap()
        XCTAssertTrue(app.navigationBars["Saved"].waitForExistence(timeout: 5), "Saved shelf must survive relaunch")
        app.tabBars.buttons["About"].tap()
        XCTAssertTrue(app.staticTexts["Editor: Jack Guler"].waitForExistence(timeout: 5))
    }
}
